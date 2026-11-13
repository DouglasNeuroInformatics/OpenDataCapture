---
type: article
title: 'Open Data Capture v2.0 : saisir des fichiers, pas seulement des formulaires'
description: 'Open Data Capture v2.0 introduit les instruments de fichiers, qui permettent aux chercheurs de recueillir des fichiers téléversés — d’un simple PDF de consentement à une séance d’IRM complète en plusieurs fichiers — aux côtés des instruments structurés et interactifs que vous utilisez déjà. Voici les nouveautés et leur fonctionnement.'
author: joshua-unrau
language: fr
translationOf: open-data-capture-v2
datePublished: 2026-06-11
isDraft: false
---

Depuis sa première version, Open Data Capture repose sur deux types d'instruments : les **formulaires**, pour les données structurées de type questionnaire, et les **instruments interactifs**, pour des tâches plus riches pilotées par du code. Les deux produisent des enregistrements structurés stockés dans la base de données. Mais toutes les données de recherche n'entrent pas aisément dans un document JSON. Parfois, la donnée _est_ un fichier : un formulaire de consentement signé, un tableur de résultats comportementaux ou les données brutes d'une séance d'imagerie.

Avec la **v2.0**, Open Data Capture introduit un troisième type d'instrument : l'**instrument de fichiers**.

## Qu'est-ce qu'un instrument de fichiers?

Un instrument de fichiers recueille un ou plusieurs fichiers téléversés comme réponse d'un participant, au lieu de champs de formulaire. Comme tout autre instrument, il est versionné, assigné à des sujets et à des séances, et régi par les mêmes contrôles d'accès précis, mais ses « données » sont un ensemble de fichiers plutôt qu'un ensemble de réponses.

Chaque instrument de fichiers définit un ou plusieurs **groupes de fichiers**, et chaque groupe déclare :

- un **nom de base** qui identifie le groupe;
- un **type de fichier** autorisé (documents, images, tableurs, données structurées ou binaire arbitraire);
- un **nombre** : le minimum et le maximum de fichiers que le groupe accepte.

Cette structure minimale couvre un large éventail de besoins concrets. Un instrument de consentement pourrait définir un seul groupe acceptant exactement un PDF. Un instrument d'imagerie peut définir un groupe acceptant de un à vingt fichiers en une seule soumission. Pour illustrer le tout, la v2.0 inclut d'emblée deux instruments d'exemple :

- **Téléchargement de fichier arbitraire** : le cas le plus simple, soit le téléversement d'un seul fichier de n'importe quel type.
- **Séance d'IRM** : un groupe de plusieurs fichiers qui modélise une séance d'imagerie complète.

## Le fonctionnement interne

Les fichiers sont fondamentalement différents des réponses à un formulaire, et la v2.0 les traite en conséquence. Plutôt que de faire transiter de gros contenus binaires par l'API jusqu'à la base de données, Open Data Capture stocke les fichiers dans un **stockage objet compatible S3** et ne conserve dans la base de données que des **métadonnées** légères (nom du fichier, taille et position au sein d'un groupe).

Les téléversements et les téléchargements se font **directement entre le navigateur et le service de stockage** au moyen d'**URL présignées** de courte durée :

1. Lorsqu'un participant ouvre un instrument de fichiers, l'API émet des URL de téléversement présignées propres à cet enregistrement.
2. Le navigateur téléverse chaque fichier directement vers le stockage, avec une barre de progression et une protection de navigation pour qu'un clic accidentel ne fasse pas perdre un téléversement à moitié terminé.
3. Une fois tous les fichiers en place, le client confirme la fin du téléversement et l'enregistrement est finalisé.

Les téléchargements fonctionnent de la même façon, en sens inverse : l'API fournit des URL de courte durée soumises au contrôle d'accès, et les fichiers sont servis avec une disposition de contenu `attachment` afin d'être téléchargés plutôt qu'affichés dans le navigateur.

Cette conception évite que les gros transferts passent par le serveur de l'API : la collecte d'une séance d'imagerie de plusieurs gigaoctets ne monopolise donc pas les ressources de l'application, comme ce serait le cas si elle transitait par le système dorsal.

## Sécurité et contrôle d'accès

Les instruments de fichiers héritent du modèle de permissions existant d'Open Data Capture. L'accès aux fichiers d'un enregistrement est limité par les mêmes capacités, au niveau du groupe et de l'enregistrement, qui protègent tous les autres enregistrements, et les URL présignées sont de courte durée par conception : quelques minutes, pas des heures. Dans le stockage, les fichiers sont cloisonnés par groupe et par enregistrement, et les liens de téléchargement expirent bien avant de pouvoir être partagés à la légère.

## Activation facultative et rétrocompatibilité complète

La mise à niveau vers la v2.0 **n'introduit aucun changement incompatible**. Le stockage objet est **facultatif** et s'active au moyen d'un seul indicateur, `STORAGE_ENABLED`, désactivé par défaut. Les déploiements existants se mettent à niveau et fonctionnent exactement comme avant : chaque formulaire et chaque instrument interactif se comporte de façon identique, et rien de nouveau n'est requis tant que vous ne décidez pas d'utiliser les instruments de fichiers.

Lorsque vous serez prêt, deux options s'offrent à vous :

- **Utiliser le service de stockage fourni.** La pile Docker Compose par défaut inclut maintenant [RustFS](https://rustfs.com), un service autohébergé compatible S3. Réglez `STORAGE_ENABLED` à `true`, fournissez un ensemble d'identifiants (le script d'installation peut les générer pour vous), et le tour est joué.
- **Utiliser votre propre S3.** Pointez Open Data Capture vers n'importe quel compartiment géré compatible S3 (AWS S3, MinIO ou un autre fournisseur) et retirez complètement le service fourni.

Comme le stockage est facultatif, le reste de l'application n'en dépend jamais. Si un instrument de fichiers est utilisé alors que le stockage est désactivé, l'API renvoie une erreur claire et exploitable, plutôt que de refuser de démarrer.

## Pour commencer

Si vous exploitez Open Data Capture, consultez le [guide de migration vers la v2.0.0](/en/docs/changelog/#200) (en anglais) pour connaître les étapes exactes de la mise à niveau, les nouvelles variables d'environnement et les remarques sur la sauvegarde de votre volume de stockage.

Les instruments de fichiers comblent l'écart entre la saisie de données structurées et les fichiers que produit la recherche réelle. Nous avons hâte de voir ce que vous recueillerez grâce à eux.
