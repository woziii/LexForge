"""
Script d'initialisation pour télécharger les ressources NLTK nécessaires
"""
import nltk

def download_nltk_resources():
    """Télécharge les ressources NLTK nécessaires."""
    resources = [
        'punkt',
        'stopwords',
        'wordnet',
        'averaged_perceptron_tagger'
    ]
    
    for resource in resources:
        print(f"Downloading NLTK resource: {resource}")
        nltk.download(resource)
    
    print("All NLTK resources downloaded successfully.")

if __name__ == "__main__":
    download_nltk_resources() 