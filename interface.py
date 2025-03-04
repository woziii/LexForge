"""
Module définissant l'interface utilisateur Gradio et l'arbre de décision du formulaire.
"""
import gradio as gr
from utils import collect_author_info
from config import (CONTRACT_TYPES, CESSION_MODES, ADDITIONAL_RIGHTS, 
                   AUTHOR_TYPES, CIVILITY_OPTIONS, SUPPORTS_OPTIONS)


def create_interface(generate_pdf_fn, preview_contract_fn):
    """
    Crée l'interface utilisateur Gradio avec l'arbre de décision pour le formulaire.
    
    Args:
        generate_pdf_fn: Fonction pour générer le PDF
        preview_contract_fn: Fonction pour prévisualiser le contrat
        
    Returns:
        gr.Blocks: L'interface Gradio configurée
    """
    with gr.Blocks(title="Générateur de Contrats de Cession") as demo:
        gr.Markdown("# Générateur de Contrats de Cession de Droits")
        gr.Markdown("Cet outil vous permet de générer des contrats de cession de droits d'auteur et/ou de droits à l'image adaptés à votre situation.")
        
        # Organisation en onglets
        with gr.Tabs():
            with gr.TabItem("Formulaire"):
                # ===== ÉTAPE 1: TYPE DE CONTRAT =====
                gr.Markdown("### 1. Type de contrat")
                gr.Markdown("Cette première étape détermine le type de contrat à générer en fonction de la nature de l'œuvre.")
                type_contrat = gr.CheckboxGroup(
                    CONTRACT_TYPES,
                    label="Quel type de contrat souhaitez-vous établir?",
                    value=["Auteur (droits d'auteur)"],
                    info="Sélectionnez 'Auteur' pour une œuvre protégée par le droit d'auteur, 'Image' pour l'utilisation de l'image d'une personne, ou les deux si nécessaire."
                )
                
                # ===== ÉTAPE 2: MODE DE CESSION =====
                gr.Markdown("### 2. Mode de cession")
                gr.Markdown("Le mode de cession détermine si la cession est gratuite ou onéreuse, ce qui influencera les droits cédés et les clauses applicables.")
                type_cession = gr.Radio(
                    CESSION_MODES,
                    label="La cession se fait-elle à titre gratuit ou onéreux?",
                    value="Gratuite",
                    info="Une cession gratuite limite les droits cédés (reproduction et représentation uniquement). Une cession onéreuse permet d'étendre ces droits."
                )
                
                # ===== ÉTAPE 2.1: DROITS CÉDÉS (uniquement si onéreux) =====
                with gr.Group(visible=False) as groupe_droits:
                    gr.Markdown("### 2.1 Droits cédés supplémentaires")
                    gr.Markdown("""
                    Pour une cession onéreuse, vous pouvez céder des droits supplémentaires en plus des droits de base:
                    - Le droit de reproduction et le droit de représentation sont toujours inclus
                    - Sélectionnez les droits supplémentaires que vous souhaitez céder
                    """)
                    droits_cedes = gr.CheckboxGroup(
                        ADDITIONAL_RIGHTS,
                        label="Sélectionnez les droits supplémentaires à céder",
                        info="Chaque droit sélectionné sera ajouté dans le contrat avec sa définition juridique précise."
                    )
                
                # ===== ÉTAPE 2.2: EXCLUSIVITÉ (uniquement si onéreux) =====
                with gr.Group(visible=False) as groupe_exclusivite:
                    gr.Markdown("### 2.2 Exclusivité")
                    gr.Markdown("""
                    L'exclusivité est une clause importante qui détermine si le cédant peut réutiliser ou céder à d'autres les mêmes droits pendant la durée du contrat.
                    """)
                    exclusivite = gr.Checkbox(
                        label="Souhaitez-vous établir une clause d'exclusivité?",
                        value=False,
                        info="Si coché, le cédant ne pourra pas céder les mêmes droits à d'autres personnes ni les utiliser lui-même pendant la durée du contrat."
                    )
                
                # ===== ÉTAPE 3: INFORMATIONS SUR L'AUTEUR/MODÈLE =====
                gr.Markdown("### 3. Informations sur l'auteur/modèle")
                gr.Markdown("Ces informations identifient précisément le cédant dans le contrat.")
                auteur_type = gr.Radio(
                    AUTHOR_TYPES,
                    label="L'auteur/modèle est-il une personne physique ou morale?",
                    value="Personne physique",
                    info="Une personne morale est une entreprise ou une association. Pour les personnes morales, assurez-vous qu'elles détiennent bien les droits (œuvre collective, logiciel, ou cession obtenue)."
                )
                
                # Champs pour personne physique (visibles par défaut)
                with gr.Group() as groupe_personne_physique:
                    gentille = gr.Radio(
                        CIVILITY_OPTIONS,
                        label="Civilité",
                        value="M."
                    )
                    nom = gr.Textbox(
                        label="Nom",
                        placeholder="Nom de famille"
                    )
                    prenom = gr.Textbox(
                        label="Prénom",
                        placeholder="Prénom"
                    )
                    date_naissance = gr.Textbox(
                        label="Date de naissance (facultatif)",
                        placeholder="JJ/MM/AAAA"
                    )
                    nationalite = gr.Textbox(
                        label="Nationalité",
                        placeholder="Ex: française"
                    )
                    adresse = gr.Textbox(
                        label="Adresse complète",
                        placeholder="Numéro, rue, code postal, ville"
                    )
                    contact_physique = gr.Textbox(
                        label="Moyen de contact (email, téléphone)",
                        placeholder="Email et/ou téléphone"
                    )
                
                # Champs pour personne morale (masqués par défaut)
                with gr.Group(visible=False) as groupe_personne_morale:
                    nom_societe = gr.Textbox(
                        label="Nom de la société",
                        placeholder="Dénomination sociale"
                    )
                    statut = gr.Textbox(
                        label="Statut juridique",
                        placeholder="Ex: SARL, SAS, EURL, etc."
                    )
                    rcs = gr.Textbox(
                        label="Numéro RCS",
                        placeholder="Ex: 123 456 789 R.C.S. Paris"
                    )
                    siege = gr.Textbox(
                        label="Adresse du siège social",
                        placeholder="Adresse complète du siège"
                    )
                    contact_morale = gr.Textbox(
                        label="Moyen de contact (email, téléphone)",
                        placeholder="Email et/ou téléphone"
                    )
                
                # ===== ÉTAPE 4: DESCRIPTION DE L'ŒUVRE (si contrat droits d'auteur) =====
                with gr.Group() as groupe_description_oeuvre:
                    gr.Markdown("### 4. Description de l'œuvre")
                    gr.Markdown("""
                    Décrivez précisément l'œuvre concernée. Cette description sera intégrée dans le contrat pour identifier sans ambiguïté l'objet de la cession.
                    """)
                    description_oeuvre = gr.Textbox(
                        label="Description de l'œuvre",
                        placeholder="Titre, format, dimensions, support, technique utilisée, date de création, etc.",
                        lines=5,
                        info="Plus la description est précise, plus le contrat sera sécurisé juridiquement."
                    )
                
                # ===== ÉTAPE 5: DESCRIPTION DE L'IMAGE (si contrat droit à l'image) =====
                with gr.Group(visible=False) as groupe_description_image:
                    gr.Markdown("### 5. Description des images")
                    gr.Markdown("""
                    Décrivez précisément les images ou vidéos concernées par la cession du droit à l'image.
                    """)
                    description_image = gr.Textbox(
                        label="Description des images/vidéos",
                        placeholder="Ex: Séance photo réalisée le [date] à [lieu], comprenant X photographies où apparaît [nom du modèle]",
                        lines=5,
                        info="Précisez le contexte, la date et le lieu de prise de vue, le nombre d'images concernées, etc."
                    )
                
                # ===== ÉTAPE 6: SUPPORTS D'EXPLOITATION =====
                gr.Markdown("### 6. Supports d'exploitation")
                gr.Markdown("""
                Sélectionnez les supports sur lesquels l'œuvre ou l'image pourra être exploitée.
                Le site web et Discord de Tellers sont automatiquement inclus.
                """)
                supports = gr.CheckboxGroup(
                    SUPPORTS_OPTIONS,
                    label="Sur quels supports les droits seront-ils exploités?",
                    value=["Réseaux sociaux (Facebook, Instagram, Twitter, etc.)"],
                    info="Vous pouvez sélectionner plusieurs supports. Le site web et Discord de Tellers sont toujours inclus."
                )
                
                # ===== ÉTAPE 7: RÉMUNÉRATION (uniquement si onéreux) =====
                with gr.Group(visible=False) as groupe_remuneration:
                    gr.Markdown("### 7. Rémunération")
                    gr.Markdown("""
                    Pour une cession onéreuse, précisez les modalités de rémunération. 
                    Cela peut être un montant forfaitaire ou proportionnel aux recettes.
                    """)
                    remuneration = gr.Textbox(
                        label="Modalités de rémunération",
                        placeholder="Ex: 500€ versés à la signature, 5% des recettes versés trimestriellement",
                        lines=3,
                        info="La rémunération doit être précise pour être juridiquement valable: montant, date(s) de paiement, modalités."
                    )
                
                # ===== BOUTONS D'ACTION =====
                gr.Markdown("### Génération du contrat")
                with gr.Row():
                    preview_btn = gr.Button("Prévisualiser le contrat", variant="secondary")
                    generate_btn = gr.Button("Générer le contrat PDF", variant="primary")
            
            # ===== ONGLET PRÉVISUALISATION =====
            with gr.TabItem("Prévisualisation"):
                apercu_contrat = gr.Textbox(
                    label="Aperçu du contrat",
                    lines=25,
                    max_lines=50,
                    interactive=False
                )
            
            # ===== ONGLET TÉLÉCHARGEMENT =====
            with gr.TabItem("Téléchargement"):
                pdf_output = gr.File(label="Contrat de cession prêt à télécharger")
        
        # ===== DÉFINITION DES INTERACTIONS CONDITIONNELLES =====
        
        # 1. Visibilité des champs en fonction du type de contrat
        def update_groups_type_contrat(type_selection):
            """Met à jour la visibilité des champs selon le type de contrat sélectionné."""
            show_auteur = "Auteur (droits d'auteur)" in type_selection
            show_image = "Image (droit à l'image)" in type_selection
            
            return {
                groupe_description_oeuvre: gr.update(visible=show_auteur),
                groupe_description_image: gr.update(visible=show_image)
            }
        
        type_contrat.change(
            fn=update_groups_type_contrat,
            inputs=type_contrat,
            outputs=[groupe_description_oeuvre, groupe_description_image]
        )
        
        # 2. Visibilité des champs en fonction du type de cession (gratuite/onéreuse)
        def update_groups_type_cession(cession_type):
            """Met à jour la visibilité des champs selon le type de cession sélectionné."""
            is_onereux = cession_type == "Onéreuse"
            return {
                groupe_droits: gr.update(visible=is_onereux),
                groupe_exclusivite: gr.update(visible=is_onereux),
                groupe_remuneration: gr.update(visible=is_onereux)
            }
        
        type_cession.change(
            fn=update_groups_type_cession,
            inputs=type_cession,
            outputs=[groupe_droits, groupe_exclusivite, groupe_remuneration]
        )
        
        # 3. Changement de formulaire selon le type d'auteur (physique/morale)
        def update_groups_type_auteur(auteur_type_val):
            """Met à jour la visibilité des champs selon le type d'auteur sélectionné."""
            is_physique = auteur_type_val == "Personne physique"
            return {
                groupe_personne_physique: gr.update(visible=is_physique),
                groupe_personne_morale: gr.update(visible=not is_physique)
            }
        
        auteur_type.change(
            fn=update_groups_type_auteur,
            inputs=auteur_type,
            outputs=[groupe_personne_physique, groupe_personne_morale]
        )
        
        # 4. Prévisualisation du contrat
        def handle_preview(type_contrat_val, type_cession_val, auteur_type_val, 
                          gentille_val, nom_val, prenom_val, date_naissance_val, nationalite_val, adresse_val, contact_physique_val,
                          nom_societe_val, statut_val, rcs_val, siege_val, contact_morale_val,
                          description_oeuvre_val, description_image_val, supports_val, droits_cedes_val, remuneration_val, exclusivite_val):
            """Gère la prévisualisation du contrat."""
            # Collecter les informations sur l'auteur/modèle
            is_physical_person = (auteur_type_val == "Personne physique")
            
            data = {
                "gentille": gentille_val,
                "nom": nom_val,
                "prenom": prenom_val,
                "date_naissance": date_naissance_val,
                "nationalite": nationalite_val,
                "adresse": adresse_val,
                "contact_physique": contact_physique_val,
                "nom_societe": nom_societe_val,
                "statut": statut_val,
                "rcs": rcs_val,
                "siege": siege_val,
                "contact_morale": contact_morale_val
            }
            
            auteur_info = collect_author_info(is_physical_person, data)
            
            # Est-ce que la cession est gratuite ?
            est_gratuit = (type_cession_val == "Gratuite")
            
            # Générer l'aperçu du contrat
            apercu = preview_contract_fn(
                type_contrat_val, est_gratuit, auteur_type_val, auteur_info,
                description_oeuvre_val, description_image_val, supports_val,
                droits_cedes_val, remuneration_val, exclusivite_val
            )
            
            return apercu
        
        preview_btn.click(
            fn=handle_preview,
            inputs=[
                type_contrat, type_cession, auteur_type, 
                gentille, nom, prenom, date_naissance, nationalite, adresse, contact_physique,
                nom_societe, statut, rcs, siege, contact_morale,
                description_oeuvre, description_image, supports, droits_cedes, remuneration, exclusivite
            ],
            outputs=apercu_contrat
        )
        
        # 5. Génération du PDF
        def handle_generate_pdf(type_contrat_val, type_cession_val, auteur_type_val, 
                               gentille_val, nom_val, prenom_val, date_naissance_val, nationalite_val, adresse_val, contact_physique_val,
                               nom_societe_val, statut_val, rcs_val, siege_val, contact_morale_val,
                               description_oeuvre_val, description_image_val, supports_val, droits_cedes_val, remuneration_val, exclusivite_val):
            """Gère la génération du PDF."""
            # Collecter les informations sur l'auteur/modèle
            is_physical_person = (auteur_type_val == "Personne physique")
            
            data = {
                "gentille": gentille_val,
                "nom": nom_val,
                "prenom": prenom_val,
                "date_naissance": date_naissance_val,
                "nationalite": nationalite_val,
                "adresse": adresse_val,
                "contact_physique": contact_physique_val,
                "nom_societe": nom_societe_val,
                "statut": statut_val,
                "rcs": rcs_val,
                "siege": siege_val,
                "contact_morale": contact_morale_val
            }
            
            auteur_info = collect_author_info(is_physical_person, data)
            
            # Est-ce que la cession est gratuite ?
            est_gratuit = (type_cession_val == "Gratuite")
            
            # Générer le PDF
            pdf_path = generate_pdf_fn(
                type_contrat_val, est_gratuit, auteur_type_val, auteur_info,
                description_oeuvre_val, description_image_val, supports_val,
                droits_cedes_val, remuneration_val, exclusivite_val
            )
            
            return pdf_path
        
        generate_btn.click(
            fn=handle_generate_pdf,
            inputs=[
                type_contrat, type_cession, auteur_type, 
                gentille, nom, prenom, date_naissance, nationalite, adresse, contact_physique,
                nom_societe, statut, rcs, siege, contact_morale,
                description_oeuvre, description_image, supports, droits_cedes, remuneration, exclusivite
            ],
            outputs=pdf_output
        )
        
        return demo
