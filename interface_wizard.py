"""
Module définissant l'interface utilisateur Gradio sous forme d'assistant progressif (wizard).
Cette version permet une navigation par étapes avec aperçu en temps réel.
"""
import gradio as gr
from utils import collect_author_info, ensure_default_supports
from text_analyzer import analyze_work_description, get_explanation
from config import (CONTRACT_TYPES, CESSION_MODES, ADDITIONAL_RIGHTS, 
                   AUTHOR_TYPES, CIVILITY_OPTIONS, SUPPORTS_OPTIONS)
import time


def create_wizard_interface(generate_pdf_fn, preview_contract_fn):
    """
    Crée l'interface utilisateur Gradio avec navigation progressive par étapes.
    
    Args:
        generate_pdf_fn: Fonction pour générer le PDF
        preview_contract_fn: Fonction pour prévisualiser le contrat
        
    Returns:
        gr.Blocks: L'interface Gradio configurée
    """
    # Définir le nombre total d'étapes
    TOTAL_STEPS = 6
    
    with gr.Blocks(title="Assistant de Contrats de Cession", css="style.css") as demo:
        # Variables d'état pour stocker les données entre les étapes
        current_step = gr.State(value=1)
        contract_data = gr.State(value={
            "type_contrat": [],
            "type_cession": "Gratuite",
            "droits_cedes": [],
            "exclusivite": False,
            "auteur_type": "Personne physique",
            "auteur_info": {},
            "description_oeuvre": "",
            "description_image": "",
            "supports": [],
            "remuneration": ""
        })
        
        gr.Markdown("# Assistant de Création de Contrat de Cession")
        gr.Markdown("Cet assistant vous guide pas à pas dans la création d'un contrat adapté à vos besoins spécifiques.")
        
        # Layout principal en deux colonnes
        with gr.Row():
            # COLONNE GAUCHE - FORMULAIRE PROGRESSIF
            with gr.Column(scale=3):
                # Indicateur de progression
                progress_bar = gr.Slider(
                    minimum=1, 
                    maximum=TOTAL_STEPS, 
                    value=1, 
                    step=1, 
                    interactive=False,
                    label="Progression"
                )
                progress_text = gr.Markdown("**Étape 1 sur 6**: Type d'œuvre")
                
                # ===== ÉTAPE 1: DESCRIPTION ET TYPE DE CONTRAT =====
                with gr.Group(visible=True) as step1_group:
                    gr.Markdown("## Décrivez votre projet")
                    gr.Markdown("""
                    Décrivez en quelques mots l'œuvre ou le contenu pour lequel vous souhaitez établir un contrat.
                    Exemples: "Une chanson que j'ai composée", "Des photos de mannequins", "Un logo pour une entreprise", etc.
                    """)
                    
                    project_description = gr.Textbox(
                        label="Description de votre projet",
                        placeholder="Ex: Une vidéo où je me filme en train de jouer ma composition au piano",
                        lines=3
                    )
                    
                    analyze_btn = gr.Button("Analyser mon projet", variant="secondary")
                    
                    contract_type_suggestion = gr.Markdown(
                        value="Complétez la description et cliquez sur 'Analyser mon projet' pour obtenir une suggestion.",
                        elem_id="contract-suggestion"
                    )
                    
                    gr.Markdown("### Type de contrat nécessaire")
                    contract_type = gr.CheckboxGroup(
                        CONTRACT_TYPES,
                        label="Sélectionnez le(s) type(s) de contrat",
                        value=[]
                    )
                
                # ===== ÉTAPE 2: MODE DE CESSION ET DROITS =====
                with gr.Group(visible=False) as step2_group:
                    gr.Markdown("## Mode de cession et droits")
                    
                    gr.Markdown("### Mode de cession")
                    gr.Markdown("""
                    La cession peut se faire à titre gratuit ou onéreux (moyennant rémunération).
                    Une cession gratuite limite les droits cédés aux droits de base (reproduction et représentation).
                    """)
                    
                    cession_mode = gr.Radio(
                        CESSION_MODES,
                        label="La cession se fait-elle à titre gratuit ou onéreux?",
                        value="Gratuite"
                    )
                    
                    # Droits cédés (visible uniquement si onéreux)
                    with gr.Group(visible=False) as group_rights:
                        gr.Markdown("### Droits supplémentaires (cession onéreuse)")
                        gr.Markdown("""
                        Pour une cession onéreuse, vous pouvez céder des droits supplémentaires.
                        Les droits de reproduction et de représentation sont toujours inclus.
                        """)
                        
                        additional_rights = gr.CheckboxGroup(
                            ADDITIONAL_RIGHTS,
                            label="Sélectionnez les droits supplémentaires à céder",
                            value=[]
                        )
                        
                        gr.Markdown("### Exclusivité")
                        gr.Markdown("""
                        L'exclusivité signifie que le cédant ne pourra pas exploiter lui-même l'œuvre 
                        ni céder les mêmes droits à d'autres personnes pendant la durée du contrat.
                        """)
                        
                        exclusivity = gr.Checkbox(
                            label="Cession exclusive",
                            value=False,
                            info="Cochez cette case pour une cession exclusive"
                        )
                
                # ===== ÉTAPE 3: INFORMATIONS SUR L'AUTEUR/MODÈLE =====
                with gr.Group(visible=False) as step3_group:
                    gr.Markdown("## Informations sur l'auteur/modèle")
                    
                    author_type = gr.Radio(
                        AUTHOR_TYPES,
                        label="L'auteur/modèle est:",
                        value="Personne physique"
                    )
                    
                    # Personne physique
                    with gr.Group() as group_physical_person:
                        civility = gr.Radio(
                            CIVILITY_OPTIONS,
                            label="Civilité",
                            value="M."
                        )
                        
                        with gr.Row():
                            last_name = gr.Textbox(
                                label="Nom",
                                placeholder="Nom de famille"
                            )
                            first_name = gr.Textbox(
                                label="Prénom",
                                placeholder="Prénom"
                            )
                        
                        with gr.Row():
                            birth_date = gr.Textbox(
                                label="Date de naissance (facultatif)",
                                placeholder="JJ/MM/AAAA"
                            )
                            nationality = gr.Textbox(
                                label="Nationalité",
                                placeholder="Ex: française"
                            )
                        
                        address = gr.Textbox(
                            label="Adresse complète",
                            placeholder="Numéro, rue, code postal, ville"
                        )
                        
                        contact_physical = gr.Textbox(
                            label="Moyen de contact (email, téléphone)",
                            placeholder="Email et/ou téléphone"
                        )
                    
                    # Personne morale
                    with gr.Group(visible=False) as group_legal_entity:
                        company_name = gr.Textbox(
                            label="Nom de la société",
                            placeholder="Dénomination sociale"
                        )
                        
                        with gr.Row():
                            legal_status = gr.Textbox(
                                label="Statut juridique",
                                placeholder="Ex: SARL, SAS, EURL, etc."
                            )
                            rcs_number = gr.Textbox(
                                label="Numéro RCS",
                                placeholder="Ex: 123 456 789 R.C.S. Paris"
                            )
                        
                        company_address = gr.Textbox(
                            label="Adresse du siège social",
                            placeholder="Adresse complète du siège"
                        )
                        
                        contact_company = gr.Textbox(
                            label="Moyen de contact (email, téléphone)",
                            placeholder="Email et/ou téléphone"
                        )
                
                # ===== ÉTAPE 4: DESCRIPTION DE L'ŒUVRE/IMAGE =====
                with gr.Group(visible=False) as step4_group:
                    description_title = gr.Markdown("## Description détaillée")
                    
                    # Description de l'œuvre (visible si contrat de droits d'auteur)
                    with gr.Group(visible=True) as group_work_description:
                        gr.Markdown("### Description de l'œuvre")
                        gr.Markdown("""
                        Décrivez précisément l'œuvre concernée par la cession de droits.
                        Cette description sera intégrée dans le contrat pour identifier sans ambiguïté l'objet de la cession.
                        """)
                        
                        work_description = gr.Textbox(
                            label="Description de l'œuvre",
                            placeholder="Titre, format, dimensions, support, technique utilisée, date de création, etc.",
                            lines=5
                        )
                    
                    # Description de l'image (visible si contrat de droits à l'image)
                    with gr.Group(visible=False) as group_image_description:
                        gr.Markdown("### Description des images")
                        gr.Markdown("""
                        Décrivez précisément les images ou vidéos concernées par la cession du droit à l'image.
                        Précisez le contexte, la date et le lieu de prise de vue, le nombre d'images concernées, etc.
                        """)
                        
                        image_description = gr.Textbox(
                            label="Description des images/vidéos",
                            placeholder="Ex: Séance photo réalisée le [date] à [lieu], comprenant X photographies où apparaît [nom du modèle]",
                            lines=5
                        )
                
                # ===== ÉTAPE 5: SUPPORTS D'EXPLOITATION =====
                with gr.Group(visible=False) as step5_group:
                    gr.Markdown("## Supports d'exploitation")
                    gr.Markdown("""
                    Sélectionnez les supports sur lesquels l'œuvre et/ou l'image pourra être exploitée.
                    Le site web et Discord de Tellers sont automatiquement inclus.
                    """)
                    
                    exploitation_supports = gr.CheckboxGroup(
                        SUPPORTS_OPTIONS,
                        label="Sur quels supports les droits seront-ils exploités?",
                        value=["Réseaux sociaux (Facebook, Instagram, Twitter, etc.)"]
                    )
                    
                    # Rémunération (visible uniquement si onéreux)
                    with gr.Group(visible=False) as group_remuneration:
                        gr.Markdown("### Rémunération")
                        gr.Markdown("""
                        Précisez les modalités de rémunération pour cette cession onéreuse.
                        Cela peut être un montant forfaitaire ou proportionnel aux recettes.
                        """)
                        
                        remuneration_details = gr.Textbox(
                            label="Modalités de rémunération",
                            placeholder="Ex: 500€ versés à la signature, 5% des recettes versés trimestriellement",
                            lines=3
                        )
                
                # ===== ÉTAPE 6: VALIDATION ET GÉNÉRATION =====
                with gr.Group(visible=False) as step6_group:
                    gr.Markdown("## Validation et génération du contrat")
                    gr.Markdown("""
                    Vous avez complété toutes les étapes nécessaires.
                    Vérifiez le contrat dans l'aperçu à droite, puis générez le PDF final.
                    """)
                    
                    gr.Markdown("### Options de génération")
                    contract_name = gr.Textbox(
                        label="Nom du fichier PDF (optionnel)",
                        placeholder="Ex: Contrat_Cession_Dupont_2025",
                        value=""
                    )
                    
                    # Indicateur de génération
                    with gr.Group(visible=False) as generation_status_group:
                        generation_status = gr.Markdown("Préparation du contrat en cours...")
                        generation_progress = gr.Slider(
                            minimum=0, 
                            maximum=100, 
                            value=0, 
                            step=1, 
                            interactive=False,
                            label="Progression"
                        )
                
                # Boutons de navigation entre les étapes
                with gr.Row():
                    back_button = gr.Button("Précédent", variant="secondary")
                    next_button = gr.Button("Suivant", variant="primary")
                
                # Bouton de génération (visible uniquement à la dernière étape)
                with gr.Row(visible=False) as generate_button_row:
                    generate_button = gr.Button("Générer le PDF", variant="primary", elem_id="generate-btn")
            
            # COLONNE DROITE - PRÉVISUALISATION EN TEMPS RÉEL
            with gr.Column(scale=2):
                # En-tête de prévisualisation
                preview_header = gr.Markdown("## Aperçu du contrat en temps réel")
                preview_info = gr.Markdown(
                    "Au fur et à mesure que vous remplissez le formulaire, votre contrat se construit ici."
                )
                
                # Prévisualisation du contrat
                contract_preview = gr.Markdown(
                    value="*Commencez à remplir le formulaire pour voir l'aperçu du contrat*",
                    elem_id="contract-preview"
                )
                
                # Zone de téléchargement (visible uniquement après génération)
                with gr.Group(visible=False) as download_group:
                    gr.Markdown("### Téléchargement")
                    pdf_output = gr.File(label="Votre contrat est prêt!")
        
        # ===== FONCTIONS DE NAVIGATION ET MISE À JOUR =====
        
        # Fonction pour mettre à jour l'indicateur de progression
        def update_progress(step):
            progress_text_value = f"**Étape {step} sur {TOTAL_STEPS}**: "
            
            if step == 1:
                progress_text_value += "Type d'œuvre"
            elif step == 2:
                progress_text_value += "Mode de cession et droits"
            elif step == 3:
                progress_text_value += "Informations sur l'auteur/modèle"
            elif step == 4:
                progress_text_value += "Description détaillée"
            elif step == 5:
                progress_text_value += "Supports d'exploitation"
            elif step == 6:
                progress_text_value += "Validation et génération"
            
            return step, progress_text_value
        
        # Fonction pour analyser la description et suggérer le type de contrat
        def analyze_project(description):
            """Analyse la description et suggère le type de contrat approprié."""
            if not description.strip():
                return "Veuillez fournir une description pour obtenir une suggestion.", []
            
            detected_types = analyze_work_description(description)
            explanation = get_explanation(detected_types)
            
            return explanation, detected_types
        
        # Associer le bouton d'analyse à la fonction
        analyze_btn.click(
            fn=analyze_project,
            inputs=[project_description],
            outputs=[contract_type_suggestion, contract_type]
        )
        
        # Fonction pour naviguer à l'étape suivante
        def next_step(current, data, 
                     # Étape 1
                     project_desc, contract_types,
                     # Étape 2
                     cession_type, rights, is_exclusive,
                     # Étape 3
                     author_type_val, civility_val, last_name_val, first_name_val, birth_date_val, 
                     nationality_val, address_val, contact_physical_val, company_name_val, 
                     legal_status_val, rcs_val, company_address_val, contact_company_val,
                     # Étape 4
                     work_desc, image_desc,
                     # Étape 5
                     supports_val, remuneration_val):
            """Passe à l'étape suivante et met à jour les données du contrat."""
            
            # Mettre à jour les données en fonction de l'étape actuelle
            if current == 1:
                data["project_description"] = project_desc
                data["type_contrat"] = contract_types
            elif current == 2:
                data["type_cession"] = cession_type
                data["droits_cedes"] = rights if rights else []
                data["exclusivite"] = is_exclusive
            elif current == 3:
                data["auteur_type"] = author_type_val
                
                # Recueillir les informations sur l'auteur en fonction du type
                if author_type_val == "Personne physique":
                    author_info = {
                        "gentille": civility_val,
                        "nom": last_name_val,
                        "prenom": first_name_val,
                        "date_naissance": birth_date_val,
                        "nationalite": nationality_val,
                        "adresse": address_val,
                        "contact": contact_physical_val
                    }
                else:
                    author_info = {
                        "nom_societe": company_name_val,
                        "statut": legal_status_val,
                        "rcs": rcs_val,
                        "siege": company_address_val,
                        "contact": contact_company_val
                    }
                
                data["auteur_info"] = author_info
            elif current == 4:
                data["description_oeuvre"] = work_desc
                data["description_image"] = image_desc
            elif current == 5:
                data["supports"] = supports_val
                data["remuneration"] = remuneration_val
            
            # Si c'est la dernière étape, ne pas avancer
            if current >= TOTAL_STEPS:
                current = TOTAL_STEPS
            else:
                current += 1
            
            # Visibilité des groupes en fonction de la nouvelle étape
            step1_visibility = (current == 1)
            step2_visibility = (current == 2)
            step3_visibility = (current == 3)
            step4_visibility = (current == 4)
            step5_visibility = (current == 5)
            step6_visibility = (current == 6)
            
            # Visibilité conditionnelle des droits supplémentaires et rémunération
            rights_visibility = (current == 2 and cession_type == "Onéreuse")
            remuneration_visibility = (current == 5 and data["type_cession"] == "Onéreuse")
            
            # Visibilité des champs de description en fonction du type de contrat
            show_work_desc = True
            show_image_desc = False
            
            if current == 4:
                show_work_desc = "Auteur (droits d'auteur)" in data["type_contrat"]
                show_image_desc = "Image (droit à l'image)" in data["type_contrat"]
            
            # Visibilité du type de personne
            show_physical_person = (current == 3 and author_type_val == "Personne physique")
            show_legal_entity = (current == 3 and author_type_val == "Personne morale")
            
            # Visibilité du bouton de génération (uniquement à la dernière étape)
            show_generate_button = (current == TOTAL_STEPS)
            
            # Mettre à jour l'aperçu du contrat
            preview = preview_contract(data)
            
            # Mettre à jour la progression
            new_progress, progress_text_val = update_progress(current)
            
            return (
                # État mis à jour
                current, data, 
                # Progression
                new_progress, progress_text_val,
                # Visibilité des étapes
                gr.update(visible=step1_visibility), gr.update(visible=step2_visibility),
                gr.update(visible=step3_visibility), gr.update(visible=step4_visibility),
                gr.update(visible=step5_visibility), gr.update(visible=step6_visibility),
                # Visibilité conditionnelle
                gr.update(visible=rights_visibility), gr.update(visible=remuneration_visibility),
                gr.update(visible=show_work_desc), gr.update(visible=show_image_desc),
                gr.update(visible=show_physical_person), gr.update(visible=show_legal_entity),
                gr.update(visible=show_generate_button),
                # Aperçu du contrat
                preview
            )
        
        # Fonction pour naviguer à l'étape précédente
        def previous_step(current, data):
            """Revient à l'étape précédente."""
            
            if current <= 1:
                current = 1
            else:
                current -= 1
            
            # Visibilité des groupes en fonction de la nouvelle étape
            step1_visibility = (current == 1)
            step2_visibility = (current == 2)
            step3_visibility = (current == 3)
            step4_visibility = (current == 4)
            step5_visibility = (current == 5)
            step6_visibility = (current == 6)
            
            # Visibilité conditionnelle des droits supplémentaires et rémunération
            rights_visibility = (current == 2 and data["type_cession"] == "Onéreuse")
            remuneration_visibility = (current == 5 and data["type_cession"] == "Onéreuse")
            
            # Visibilité des champs de description en fonction du type de contrat
            show_work_desc = True
            show_image_desc = False
            
            if current == 4:
                show_work_desc = "Auteur (droits d'auteur)" in data["type_contrat"]
                show_image_desc = "Image (droit à l'image)" in data["type_contrat"]
            
            # Visibilité du type de personne
            show_physical_person = (current == 3 and data["auteur_type"] == "Personne physique")
            show_legal_entity = (current == 3 and data["auteur_type"] == "Personne morale")
            
            # Visibilité du bouton de génération (uniquement à la dernière étape)
            show_generate_button = (current == TOTAL_STEPS)
            
            # Mettre à jour l'aperçu du contrat
            preview = preview_contract(data)
            
            # Mettre à jour la progression
            new_progress, progress_text_val = update_progress(current)
            
            return (
                # État mis à jour
                current, data, 
                # Progression
                new_progress, progress_text_val,
                # Visibilité des étapes
                gr.update(visible=step1_visibility), gr.update(visible=step2_visibility),
                gr.update(visible=step3_visibility), gr.update(visible=step4_visibility),
                gr.update(visible=step5_visibility), gr.update(visible=step6_visibility),
                # Visibilité conditionnelle
                gr.update(visible=rights_visibility), gr.update(visible=remuneration_visibility),
                gr.update(visible=show_work_desc), gr.update(visible=show_image_desc),
                gr.update(visible=show_physical_person), gr.update(visible=show_legal_entity),
                gr.update(visible=show_generate_button),
                # Aperçu du contrat
                preview
            )
        
        # Fonction pour mettre à jour l'affichage en fonction du mode de cession
        def update_cession_mode_display(mode):
            """Met à jour l'affichage des champs liés au mode de cession."""
            is_onereux = (mode == "Onéreuse")
            return gr.update(visible=is_onereux)
        
        # Fonction pour mettre à jour l'affichage en fonction du type d'auteur
        def update_author_type_display(type_val):
            """Met à jour l'affichage des champs liés au type d'auteur."""
            is_physical = (type_val == "Personne physique")
            return gr.update(visible=is_physical), gr.update(visible=not is_physical)
        
        # Fonction pour générer le PDF
        def generate_pdf(contract_data, filename):
            """Génère le PDF du contrat avec indication de progression."""
            
            # Mise à jour de l'interface pour indiquer le début de la génération
            yield gr.update(visible=True), gr.update(value="Préparation des données..."), 0, gr.update(visible=False), None
            time.sleep(0.5)
            
            # Étape 1: Préparation du contrat (25%)
            yield gr.update(visible=True), gr.update(value="Construction du contrat..."), 25, gr.update(visible=False), None
            time.sleep(0.5)
            
            # Étape 2: Mise en forme (50%)
            yield gr.update(visible=True), gr.update(value="Mise en forme du document..."), 50, gr.update(visible=False), None
            time.sleep(0.5)
            
            # Étape 3: Génération du PDF (75%)
            yield gr.update(visible=True), gr.update(value="Génération du PDF..."), 75, gr.update(visible=False), None
            
            # Appel à la fonction de génération réelle
            pdf_path = generate_pdf_fn(
                contract_data["type_contrat"],
                contract_data["type_cession"],
                contract_data["auteur_type"],
                contract_data["auteur_info"],
                contract_data["description_oeuvre"],
                contract_data["description_image"],
                contract_data["supports"],
                contract_data["droits_cedes"],
                contract_data["remuneration"],
                contract_data["exclusivite"]
            )
            
            # Finalisation (100%)
            yield gr.update(visible=True), gr.update(value="Contrat PDF généré avec succès!"), 100, gr.update(visible=True), pdf_path
        
        # Fonction simplifiée pour prévisualiser le contrat
        def preview_contract(data):
            """Génère un aperçu HTML formaté du contrat."""
            
            # Vérifier qu'il y a suffisamment de données pour prévisualiser
            if not data.get("type_contrat"):
                return "*Complétez au moins le type de contrat pour voir l'aperçu*"
            
            # Appeler la fonction de prévisualisation
            try:
                preview_text = preview_contract_fn(
                    data.get("type_contrat", []),
                    data.get("type_cession", "Gratuite"),
                    data.get("auteur_type", "Personne physique"),
                    data.get("auteur_info", {}),
                    data.get("description_oeuvre", ""),
                    data.get("description_image", ""),
                    data.get("supports", []),
                    data.get("droits_cedes", []),
                    data.get("remuneration", ""),
                    data.get("exclusivite", False)
                )
                
                # Conversion en HTML avec mise en évidence des données utilisateur
                preview_html = preview_text.replace("\n", "<br>")
                
                # Mettre en évidence les titres
                for ligne in preview_text.split("\n"):
                    if ligne.strip().startswith("ARTICLE") or ligne.strip().isupper():
                        preview_html = preview_html.replace(ligne, f"<h3>{ligne}</h3>")
                
                return preview_html
            except Exception as e:
                return f"*Erreur de prévisualisation: {str(e)}*"
        
        # ===== ÉVÉNEMENTS =====
        
        # Navigation entre les étapes
        next_button.click(
            fn=next_step,
            inputs=[
                current_step, contract_data,
                # Étape 1
                project_description, contract_type,
                # Étape 2
                cession_mode, additional_rights, exclusivity,
                # Étape 3
                author_type, civility, last_name, first_name, birth_date, 
                nationality, address, contact_physical, company_name, 
                legal_status, rcs_number, company_address, contact_company,
                # Étape 4
                work_description, image_description,
                # Étape 5
                exploitation_supports, remuneration_details
            ],
            outputs=[
                current_step, contract_data,
                # Progression
                progress_bar, progress_text,
                # Visibilité des étapes
                step1_group, step2_group, step3_group, step4_group, step5_group, step6_group,
                # Visibilité conditionnelle
                group_rights, group_remuneration,
                group_work_description, group_image_description,
                group_physical_person, group_legal_entity,
                generate_button_row,
                # Aperçu du contrat
                contract_preview
            ]
        )
        
        back_button.click(
            fn=previous_step,
            inputs=[current_step, contract_data],
            outputs=[
                current_step, contract_data,
                # Progression
                progress_bar, progress_text,
                # Visibilité des étapes
                step1_group, step2_group, step3_group, step4_group, step5_group, step6_group,
                # Visibilité conditionnelle
                group_rights, group_remuneration,
                group_work_description, group_image_description,
                group_physical_person, group_legal_entity,
                generate_button_row,
                # Aperçu du contrat
                contract_preview
            ]
        )
        
        # Mise à jour des affichages conditionnels
        cession_mode.change(
            fn=update_cession_mode_display,
            inputs=[cession_mode],
            outputs=[group_rights]
        )
        
        author_type.change(
            fn=update_author_type_display,
            inputs=[author_type],
            outputs=[group_physical_person, group_legal_entity]
        )
        
        # Génération du PDF
        generate_button.click(
            fn=generate_pdf,
            inputs=[contract_data, contract_name],
            outputs=[
                generation_status_group, generation_status, 
                generation_progress, download_group, pdf_output
            ]
        )
        
        return demo
