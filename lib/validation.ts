import * as Yup from "yup"

export const employeeValidationSchema = Yup.object({
  mois: Yup.string().required("Le mois est requis"),
  nom: Yup.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .required("Le nom est requis"),
  prenom: Yup.string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères")
    .required("Le prénom est requis"),
  telephone: Yup.string()
    .matches(/^[0-9+\-\s()]+$/, "Format de téléphone invalide")
    .min(8, "Le numéro doit contenir au moins 8 chiffres")
    .required("Le numéro de téléphone est requis"),
  matricule: Yup.string()
    .min(3, "Le matricule doit contenir au moins 3 caractères")
    .max(20, "Le matricule ne peut pas dépasser 20 caractères")
    .required("Le matricule est requis"),
  diplome: Yup.string().required("Le diplôme est requis"),
  categorie: Yup.string()
    .oneOf(["Chef de département", "Agent", "Directeur", "Directeur Adjoint", "Directrice"], "Catégorie invalide")
    .required("La catégorie est requise"),
  departement: Yup.string()
    .oneOf(["Communication", "Finance", "Général", "GRH", "Juridique", "Planification"], "Département invalide")
    .required("Le département est requis"),
  congesRestants: Yup.number()
    .min(0, "Les congés restants ne peuvent pas être négatifs")
    .max(365, "Les congés restants ne peuvent pas dépasser 365 jours")
    .required("Les congés restants sont requis"),
  autorisationRestante: Yup.number()
    .min(0, "Les autorisations restantes ne peuvent pas être négatives")
    .max(100, "Les autorisations restantes ne peuvent pas dépasser 100")
    .required("Les autorisations restantes sont requises"),
  autorisationEcoulee: Yup.number()
    .min(0, "Les autorisations écoulées ne peuvent pas être négatives")
    .max(100, "Les autorisations écoulées ne peuvent pas dépasser 100")
    .required("Les autorisations écoulées sont requises"),
  absence: Yup.number()
    .min(0, "Les absences ne peuvent pas être négatives")
    .max(365, "Les absences ne peuvent pas dépasser 365 jours")
    .required("Les absences sont requises"),
})
