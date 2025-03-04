import gradio as gr
from interface import create_interface
from pdf_generator import generate_pdf
from contract_previewer import preview_contract

# Point d'entrée principal de l'application
def main():
    """
    Point d'entrée principal de l'application.
    Crée l'interface Gradio et lance l'application.
    """
    # Création de l'interface Gradio avec injection des fonctions de génération et prévisualisation
    demo = create_interface(generate_pdf, preview_contract)
    
    # Lancement de l'application
    demo.launch()

if __name__ == "__main__":
    main()
