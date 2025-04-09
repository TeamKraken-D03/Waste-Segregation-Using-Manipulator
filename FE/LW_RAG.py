import streamlit as st
import json
import os
import dotenv
import google.generativeai as genai
from collections import Counter

# Load environment variables
dotenv.load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    st.error("GEMINI_API_KEY is missing! Check your .env file.")
    st.stop()

genai.configure(api_key=GEMINI_API_KEY)
model_name = "gemini-2.0-flash"

# Hide Streamlit UI elements
st.markdown("""
    <style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    </style>
""", unsafe_allow_html=True)

# Load JSON files
def load_json_file(json_file):
    if not os.path.exists(json_file):
        st.error(f"File not found: {json_file}")
        return []
    try:
        with open(json_file, "r") as file:
            data = json.load(file)
            if isinstance(data, list):
                return data
            return data.get("detected_objects", [])
    except Exception as e:
        st.error(f"Error loading JSON file: {e}")
        return []

detected_objects = load_json_file("waste.JSON")
knowledge_base = load_json_file("Knowledge_source.json")

# Retrieve context from knowledge base if available
def retrieve_context(label, kb):
    for entry in kb:
        if entry["label"].lower() == label.lower():
            return (
                f"Label: {entry['label']}\n"
                f"Material: {entry['material']}\n"
                f"Recyclable: {entry['recyclable']}\n"
                f"Disposal: {entry['disposal']}\n"
            )
    return ""  # Exclude if not found

# Build RAG prompt with knowledge base
def generate_rag_prompt(detected_objects, knowledge_base, not_found_labels):
    prompt = "You are an AI waste classification assistant. Based on the following context from a knowledge base, classify the detected items.\n\n"
    prompt += "Knowledge Base:\n"

    unique_labels = set(obj["label"] for obj in detected_objects)
    for label in unique_labels:
        context = retrieve_context(label, knowledge_base)
        if context:
            prompt += context + "\n"
        else:
            not_found_labels.append(label)

    prompt += "\nNow, here are the detected waste items:\n"
    for obj in detected_objects:
        prompt += f"- {obj['label']}\n"

    prompt += "\nSummarize each item's recyclability and disposal methods based on the knowledge base above. If no information is provided for an item, reason and provide a best guess based on general waste knowledge."
    return prompt

# Classify waste using RAG
def classify_waste_rag(detected_objects, knowledge_base):
    not_found_labels = []
    prompt = generate_rag_prompt(detected_objects, knowledge_base, not_found_labels)
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content([prompt])
        result = response.text if hasattr(response, "text") else str(response)
        return result, not_found_labels
    except Exception as e:
        return {"error": f"API request failed: {e}"}, []

# UI rendering
st.title("♻ AI-Powered Waste Classification (RAG Enhanced)")
st.write("This app classifies waste using a retrieval-augmented knowledge base.")

if detected_objects:
    st.subheader("🧾 Detected Waste Items")
    label_counts = Counter([obj["label"] for obj in detected_objects])
    for label, count in label_counts.items():
        st.write(f"- {label}: {count}")

if st.button("Classify Waste"):
    if not detected_objects:
        st.error("No waste items found.")
    elif not knowledge_base:
        st.error("Knowledge base is missing or empty.")
    else:
        with st.spinner("Retrieving context and classifying..."):
            result, not_found = classify_waste_rag(detected_objects, knowledge_base)

        if isinstance(result, dict) and "error" in result:
            st.error(result["error"])
        else:
            st.subheader("📝 Classification Results")
            st.markdown(result)

            # if not_found:
                # for label in not_found:
                    # st.write(f"- {label}")
