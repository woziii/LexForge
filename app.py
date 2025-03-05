"""
Point d'entrée principal de l'application.
Module optimisé pour le déploiement sur Hugging Face Spaces.
Cette version utilise l'interface en mode wizard (assistant progressif).
"""

import gradio as gr
from interface_wizard import create_wizard_interface
from pdf_generator import generate_pdf
from contract_previewer import preview_contract

# Point d'entrée principal de l'application
def main():
    """
    Point d'entrée principal de l'application.
    Crée l'interface Gradio et lance l'application.
    """
    # Création de l'interface Gradio avec injection des fonctions de génération et prévisualisation
    demo = create_wizard_interface(generate_pdf, preview_contract)
    
    # Lancement de l'application avec les paramètres optimisés pour Hugging Face Spaces
    demo.launch(share=False, server_name="0.0.0.0", server_port=7860)

if __name__ == "__main__":
    main()