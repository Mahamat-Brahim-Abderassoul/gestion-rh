import type { Employee, EmployeeFormData } from "@/types/employee"

const STORAGE_KEY = "gestion-rh-employees"

export class EmployeeService {
  static getAll(): Employee[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }

  static getById(id: string): Employee | null {
    const employees = this.getAll()
    return employees.find((emp) => emp.id === id) || null
  }

  static create(data: EmployeeFormData): Employee {
    const employees = this.getAll()
    const newEmployee: Employee = {
      id: Date.now().toString(),
      ...data,
      dateCreation: new Date().toISOString(),
      dateModification: new Date().toISOString(),
    }

    employees.push(newEmployee)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees))
    return newEmployee
  }

  static update(id: string, data: EmployeeFormData): Employee | null {
    const employees = this.getAll()
    const index = employees.findIndex((emp) => emp.id === id)

    if (index === -1) return null

    employees[index] = {
      ...employees[index],
      ...data,
      dateModification: new Date().toISOString(),
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees))
    return employees[index]
  }

  static delete(id: string): boolean {
    const employees = this.getAll()
    const filteredEmployees = employees.filter((emp) => emp.id !== id)

    if (filteredEmployees.length === employees.length) return false

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEmployees))
    return true
  }

  static search(query: string, field?: keyof Employee): Employee[] {
    const employees = this.getAll()
    const searchQuery = query.toLowerCase()

    return employees.filter((employee) => {
      if (field) {
        const value = employee[field]
        return value?.toString().toLowerCase().includes(searchQuery)
      }

      // Recherche dans tous les champs texte
      return (
        employee.nom.toLowerCase().includes(searchQuery) ||
        employee.prenom.toLowerCase().includes(searchQuery) ||
        employee.matricule.toLowerCase().includes(searchQuery) ||
        employee.telephone.toLowerCase().includes(searchQuery) ||
        employee.diplome.toLowerCase().includes(searchQuery) ||
        employee.categorie.toLowerCase().includes(searchQuery) ||
        employee.departement.toLowerCase().includes(searchQuery) ||
        employee.mois.toLowerCase().includes(searchQuery)
      )
    })
  }
}
