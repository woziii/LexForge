import React from "react";
import { FloatingDock } from "./floating-dock";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MessageCircle,
  MessagesSquare,
  Save
} from "lucide-react";

export default function EditorFloatingDock({ 
  onFormat, 
  onSave, 
  onAddComment,
  onToggleComments,
  showComments
}) {
  const editorTools = [
    {
      title: "Gras",
      icon: (
        <Bold className="h-full w-full text-neutral-600 dark:text-neutral-300" />
      ),
      href: "#",
      onClick: () => onFormat('bold')
    },
    {
      title: "Italique",
      icon: (
        <Italic className="h-full w-full text-neutral-600 dark:text-neutral-300" />
      ),
      href: "#",
      onClick: () => onFormat('italic')
    },
    {
      title: "Souligné",
      icon: (
        <Underline className="h-full w-full text-neutral-600 dark:text-neutral-300" />
      ),
      href: "#",
      onClick: () => onFormat('underline')
    },
    {
      title: "Aligner à gauche",
      icon: (
        <AlignLeft className="h-full w-full text-neutral-600 dark:text-neutral-300" />
      ),
      href: "#",
      onClick: () => onFormat('alignLeft')
    },
    {
      title: "Centrer",
      icon: (
        <AlignCenter className="h-full w-full text-neutral-600 dark:text-neutral-300" />
      ),
      href: "#",
      onClick: () => onFormat('alignCenter')
    },
    {
      title: "Aligner à droite",
      icon: (
        <AlignRight className="h-full w-full text-neutral-600 dark:text-neutral-300" />
      ),
      href: "#",
      onClick: () => onFormat('alignRight')
    },
    {
      title: "Ajouter un commentaire",
      icon: (
        <MessageCircle className="h-full w-full text-yellow-500 dark:text-yellow-400" />
      ),
      href: "#",
      onClick: onAddComment
    },
    {
      title: showComments ? "Masquer commentaires" : "Voir commentaires",
      icon: (
        <MessagesSquare className={`h-full w-full ${showComments ? 'text-blue-500' : 'text-blue-400 dark:text-blue-300'}`} />
      ),
      href: "#",
      onClick: onToggleComments
    },
    {
      title: "Enregistrer",
      icon: (
        <Save className="h-full w-full text-green-600 dark:text-green-400" />
      ),
      href: "#",
      onClick: onSave
    }
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <FloatingDock
        items={editorTools}
        desktopClassName="shadow-lg border border-gray-200/50 dark:border-neutral-700/50 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm"
        mobileClassName="shadow-lg border border-gray-200/50 dark:border-neutral-700/50 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm"
      />
    </div>
  );
} 