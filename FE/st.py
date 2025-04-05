import streamlit as st
import json
import os
import dotenv
import google.generativeai as genai
from collections import Counter

dotenv.load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    st.error("GEMINI_API_KEY is missing! Check your .env file.")
    st.stop()

genai.configure(api_key=GEMINI_API_KEY)
model_name = "gemini-2.0-flash"

st.markdown(
    """
    <style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    </style>
    """,
    unsafe_allow_html=True,
)

def load_detected_objects(json_file):
    if not os.path.exists(json_file):
        st.error(f"JSON file not found: {json_file}")
        return []

    try:
        with open(json_file, "r") as file:
            data = json.load(file)
            if isinstance(data, list):
                return data
            return data.get("detected_objects", [])
    except json.JSONDecodeError:
        st.error("Invalid JSON format! Please check your file.")
        return []
    except Exception as e:
        st.error(f"Error loading JSON file: {str(e)}")
        return []

json_file_path = "waste.JSON"
detected_objects = load_detected_objects(json_file_path)

def generate_prompt(detected_objects):
    prompt = "The following waste items were detected:\n"
    for obj in detected_objects:
        prompt += f"- {obj['label']}\n"
    prompt += (
        "\nFor each item, determine:\n"
        "1. The material composition (plastic, metal, paper, etc.).\n"
        "2. Whether it is recyclable or not.\n"
        "3. Any potential recycling or disposal methods."
    )
    return prompt

def classify_waste(detected_objects):
    prompt = generate_prompt(detected_objects)
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content([prompt])
        response_text = response.text if hasattr(response, "text") else str(response)
        return response_text
    except Exception as e:
        return {"error": f"API request failed: {str(e)}"}

st.title("♻ AI-Powered Waste Classification")
st.write("This application detects waste items and determines their recyclability.")

if detected_objects:
    st.subheader("🧾 Detected Waste Items")
    label_counts = Counter([obj["label"] for obj in detected_objects])
    for label, count in label_counts.items():
        st.write(f"- {label}: {count}")

if st.button("Classify Waste"):
    if not detected_objects:
        st.error("No waste items detected in the JSON file.")
    else:
        with st.spinner("Processing..."):
            result = classify_waste(detected_objects)

        if isinstance(result, dict) and "error" in result:
            st.error(result["error"])
        else:
            st.subheader("📝 Classification Results")
            st.markdown(result)

