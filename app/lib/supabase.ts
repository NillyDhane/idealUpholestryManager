import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UpholsteryOrder = {
  id?: string;
  createdAt?: string;
  vanNumber: string;
  model: string;
  orderDate: string;
  brandOfSample: string;
  colorOfSample: string;
  bedHead: "Small" | "Large";
  arms: "Short" | "Large" | "Recessed Footrest" | "GT arm";
  base: string;
  magPockets:
    | "1 x Large"
    | "1 x Small"
    | "1 x Large + 2 small"
    | "1 x Large + 3 small";
  headBumper: "false" | "true";
  other: "Bunk Facia 1" | "Bunk Facia 2" | "Bunk Facia 3" | "";
  loungeType: "Cafe" | "Club" | "L shape" | "Straight";
  design: "Essential Back" | "Soft Back" | "As Per Picture" | "Other";
  curtain: "Yes" | "No";
  stitching: "Contrast" | "Single" | "Double" | "Same Colour";
  bunkMattresses: "None" | "2" | "3";
  presetName?: string;
};
