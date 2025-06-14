export interface Employee {
  id?: string
  _id?: string // Pour MongoDB
  mois: string
  nom: string
  prenom: string
  telephone: string
  matricule: string
  diplome: string
  categorie: string
  departement: string
  congesRestants: number
  autorisationRestante: number
  autorisationEcoulee: number
  absence: number
  dateCreation?: string
  dateModification?: string
  createdAt?: string // Pour MongoDB
  updatedAt?: string // Pour MongoDB
}

export interface EmployeeFormData {
  mois: string
  nom: string
  prenom: string
  telephone: string
  matricule: string
  diplome: string
  categorie: string
  departement: string
  congesRestants: number
  autorisationRestante: number
  autorisationEcoulee: number
  absence: number
}
