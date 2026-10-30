export interface SeedAddress {
  street: string;
  exteriorNumber: string;
  interiorNumber?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface SeedUser {
  name: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  roles: string[];
  isActive: boolean;
  addresses: SeedAddress[];
}