export type District = {
  id: number;
  code: string;
  name: string;
};

export type Neighborhood = {
  id: number;
  code: string;
  name: string;
  district_id: number;
  district_name: string;
};

// A single (barrio, year) price point for venta_eur_m2.
export type PricePoint = {
  neighborhood_id: number;
  year: number;
  price: number;
};

// A single (distrito, year) price point for alquiler_eur_m2_mes.
export type RentPoint = {
  district_id: number;
  year: number;
  price: number;
};

export type Metric = "venta_eur_m2" | "alquiler_eur_m2_mes";
export type Granularity = "year" | "month";
