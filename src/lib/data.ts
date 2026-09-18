import { supabase } from "./supabase";
import type { District, Neighborhood, PricePoint, RentPoint } from "./types";

export async function fetchDistricts(): Promise<District[]> {
  const { data, error } = await supabase
    .from("districts")
    .select("id, code, name")
    .order("id");
  if (error) throw error;
  return data;
}

export async function fetchNeighborhoods(): Promise<Neighborhood[]> {
  const { data, error } = await supabase
    .from("neighborhoods")
    .select("id, code, name, district_id, districts(name)")
    .order("code");
  if (error) throw error;
  return (data as unknown as Array<{
    id: number;
    code: string;
    name: string;
    district_id: number;
    districts: { name: string } | null;
  }>).map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    district_id: row.district_id,
    district_name: row.districts?.name ?? "",
  }));
}

export async function fetchVentaPrices(): Promise<PricePoint[]> {
  const { data, error } = await supabase
    .from("price_observations")
    .select("neighborhood_id, period_date, price")
    .eq("metric", "venta_eur_m2")
    .not("neighborhood_id", "is", null)
    .order("period_date");
  if (error) throw error;
  return (data as Array<{ neighborhood_id: number; period_date: string; price: number }>).map(
    (row) => ({
      neighborhood_id: row.neighborhood_id,
      year: new Date(row.period_date).getUTCFullYear(),
      price: row.price,
    })
  );
}

export async function fetchAlquilerPrices(): Promise<RentPoint[]> {
  const { data, error } = await supabase
    .from("price_observations")
    .select("district_id, period_date, price")
    .eq("metric", "alquiler_eur_m2_mes")
    .not("district_id", "is", null)
    .order("period_date");
  if (error) throw error;
  return (data as Array<{ district_id: number; period_date: string; price: number }>).map(
    (row) => ({
      district_id: row.district_id,
      year: new Date(row.period_date).getUTCFullYear(),
      price: row.price,
    })
  );
}
