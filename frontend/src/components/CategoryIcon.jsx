import {
  MdRestaurant, MdFlight, MdAccountBalance, MdBusiness, MdCategory,
  MdLocalHospital, MdSchool, MdHome, MdDirectionsCar, MdComputer,
  MdCelebration, MdCheckroom, MdElectricBolt, MdPhoneAndroid,
  MdShoppingCart, MdSportsEsports, MdFitnessCenter, MdLocalGasStation,
  MdWifi, MdSubscriptions,
} from "react-icons/md";

const ICON_MAP = {
  MdRestaurant: MdRestaurant,
  MdFlight: MdFlight,
  MdAccountBalance: MdAccountBalance,
  MdBusiness: MdBusiness,
  MdCategory: MdCategory,
  MdLocalHospital: MdLocalHospital,
  MdSchool: MdSchool,
  MdHome: MdHome,
  MdDirectionsCar: MdDirectionsCar,
  MdComputer: MdComputer,
  MdCelebration: MdCelebration,
  MdCheckroom: MdCheckroom,
  MdElectricBolt: MdElectricBolt,
  MdPhoneAndroid: MdPhoneAndroid,
  MdShoppingCart: MdShoppingCart,
  MdSportsEsports: MdSportsEsports,
  MdFitnessCenter: MdFitnessCenter,
  MdLocalGasStation: MdLocalGasStation,
  MdWifi: MdWifi,
  MdSubscriptions: MdSubscriptions,
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

export default function CategoryIcon({ name, size = 18, className = "" }) {
  const Icon = ICON_MAP[name] || MdCategory;
  return <Icon size={size} className={className} />;
}
