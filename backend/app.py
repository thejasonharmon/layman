from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
from openai import OpenAI
import requests
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app, origins=["*"], resources={r"/*": {"origins": "*", "methods": ["POST", "GET"]}})


# Existing functions here (extract_text_from_pdf and summarize_text_with_chatgpt)
def extract_text_from_pdf(pdf_path):
    text = ''
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + '\n'  # add a newline character after each page
    return text

def summarize_text_with_chatgpt(text, api_key):
    client = OpenAI(
    api_key=api_key,
)
    
    try:
        response = client.chat.completions.create(
            model="gpt-4-turbo",  # Update the model name as necessary
            messages=[{"role": "system", "content": "You are a helpful assistant."},
                      {"role": "user", "content": "Summarize this text in a short paragraph:\n" + text}]
        )
        return response.choices[0].message.content
    except Exception as e:
        print("An error occurred:", e)
        return None

def download_pdf(pdf_url):
    response = requests.get(pdf_url)
    if response.status_code == 200:
        return response.content
    else:
        return None

@app.route('/upload', methods=['POST'])
def handle_upload():
    pdf_url = request.json.get('pdf_url')
    api_key = request.headers.get('Authorization')

    # Download PDF
    pdf_content = download_pdf(pdf_url)
    if not pdf_content:
        return jsonify({"error": "Failed to download PDF"}), 400

    # Save temporary PDF
    pdf_path = 'tmp/temp_pdf.pdf'
    with open(pdf_path, 'wb') as f:
        f.write(pdf_content)

    # Extract text from PDF
    text = extract_text_from_pdf(pdf_path)
    if not text:
        return jsonify({"error": "Failed to extract text from PDF"}), 400

    # Summarize text
    summary = summarize_text_with_chatgpt(text, api_key)
    if not summary:
        return jsonify({"error": "Failed to summarize text"}), 500

    return jsonify({"summary": summary})

# Initialize OpenAI client globally if the API key doesn't change frequently
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

if __name__ == '__main__':
    app.run(debug=True)
