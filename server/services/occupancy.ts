import { storage } from "../storage";
import type { OccupancyCode } from "@shared/schema";

// Parse the nature of work master CSV data
const occupancyListRaw = `
-Advertisement contractors bill posters and distributors
-Aerated water manufacturers
-Agricultural farms
-Builders - construction incl civil constructions
-Cable laying, installation & erection work - away from shop/yard risk
-Cable Laying, installation & erection work - shop/yard risk
-Card, cardboard, strawboard and millboard makers
-Caretakers durwans, chowkidars and gatekeepers
-Carpenters
-Cement works (excl quarry & mining risk)
-Chemical works
-Cotton mills
-Dairies
-Distilleries
-Drainage services
-Electricity - power supply
-Engineering workshop & fabrication works (up to 9 meters)
-Engineering workshop & fabrication works (above 9 meters)
-Flour and dal Mills
-Furniture mfg
-Glass mfg (stained)
-Hotels - indoor
-Hotels - outdoor
-Ice dealers & mfg
-Indoor clerical works
-Jute mills
-Laundries
-Metal workers
-Milk mfg
-Motor garages, showrooms and assemblers of motor vehicles
-Oil mills (not mineral oils) and oilcake manufacturers
-Painters & decorators
-Pharma, chemists & druggists
-Plastic goods mfgrs
-Rice millers
-Road paving, tarring and road making
-Rubber & tyre mfg
-Steavedoring
-Steel works
-Stone breaking excl blasting
-Tea gardens
-Tent erection only
-Tent makers
-Tools & machine tools mfg
-Welders
-Window cleaners
-Wire good makers
-Loading and unloading
-Cold storage warehouses
-Frozen food mfgrs
-Motor Vehicle small parts (metal)
-Motor garages, showrooms and assemblers of motor Vehicles - all other employees incl. salesman drivers all mechanics
-Builders - steeple, tower and chimney shaft builders or repairers
-Sugar cane plantation
-Sugar, saccharine and glucose refiners and/or mfgrs incl. sugarcane crushing factories engaged in preparing jagree
-Sugar sweet mfgrs
-Aluminium goods manufacture
-Animal (wild)
-Asbestos cement manufacturers
-Athletic, fishing, gymnastic, cricket and golf goods manufacturers
-Auctioneers
-Bakeries and biscuit factories
-Bamboo and bentwood furniture makers
-Barge, boat, launch and yatch only builders
-Brick and tile makers
-Cement hollow block mfgrs
-Clothing & underclothing mfgrs
-Coal merchants & dealers
-Commercial travellers
-Cordial (fruit) and canned fruit mfgrs
-Coal and geological drilling
-Domestic servants  (in private residences or in personal service of employer residence in boarding house club or hotel (not in employee of proprietors)
-Educational training institutions, schools and college staff (excl. veterinary colleges)
-Electric refrigerators and air conditioners assembling (installation maintenance and repairs )
-Cranes
-Jewelers, goldsmith and silversmith
-Paper mfgr
-Petro pump stations
-Stationers
-Steel or iron founders
-Tea packing factories
-Railway construction and alteration
-Electrical engineers (not manufacturers) installation and repair of plant, fittings and appartus incl. wireless, telephone and telegraph
-Yarn production
-Boiler Makers and Repairers
-Dentists
-Analytical chemists
-Architects
-Porters and assistants excl. risk connection with horses and livestock
-Porters and assistants for  horses and livestock
-Badami compressed coal manufactures
-Crane drivers
-Insecticides/pesticide spraying
-Pest control and fumigation
-Petrochemical industry
-Plumber, hotwater and sanitary engineers ( where carried on as separate trade)
-Gas Mfgrs
-Waterworks and Pumping Stations
-Roofing and flooring makers/layers (not slaters or tilers)
-Liquified Petroleum Gas Dealers
-Slaters and Tilers (Roofs) where carried on as a separate trade
-Sewer and Road Contractors
-Fire Work Mfgrs
-Tyre Retreading and Resolving
-Electrical Engineer (manufacturers) - Makers of fittings and apparatus incl. wireless, telephone, T.V. and Radio cum Recorder Manufacturers & Computer manufacturing - Shop and yard risk only
-Excavation, Earth Removal and Filling and Reclamation (not for Sewers and Roads)
-Open Cast Coal-Getting (incl. use of explosives)
-Quarries
-Machinery and Metal
-Photographers and Photographic Appliances Dealers
-Lift Repairing Machinists
-Tilers (not roofing) and Mosaic and Tressellated Pavers
-Railway up-keep and Running - Excl. Construction
-Oil companies importing in bulk for retail distribution
-Waste workers and re-claimers
-Glaziers
-Zinc Copper and Brass Rolling where no smelting is done
-Marble and granite works (includes dressing and polishing) - not in connection with quarries
-Godown coolies (not engaged in delivering for shipment)
-Tin & Steel and Steel Metal Workers (including metal boxes and drums)
-Mechanics
-Oil Well Proprietors and Mineral Oil Refiners
-Woodmen and Foresters engaged in Treefelling  Sawing and Carting and Forest Fire Fighting
-Mechanical appliances like tractors, harvesters and ploughers
-Fire Extinguishing Appliances Makers
-Poultry and Hatchery
-Riggers
-Housekeeping Staff- indoor
-Housekeeping Staff- outdoor
-Shop Risk
-Carman, cartage and contractors - includes motor transport companies (non passenger carrying)
-Furniture dealers, removers and depository proprietors
-Club servants - All employees including waiters
-Forwarding and shipping agent's receiving offices, depots and godowns
-Electric lights and telephone wire coverers - Electric sign makers
-Builders, material, stone, slate and pottery dealers
-Tyre vulcanizers (when carried as a separate trade)
-Carpet and rug manufacturers
-Tower, turret and railway clock fixing, repairing and winding
-Leather goods manufacturers
-Paint color and enamal manufacturers
-Cotton only yarn makers
-Printers and lithographers (excluding paper manufacturers)
-Hydraulic Machinery (excluding lift/crane making and erecting)
-Ship builders - iron, steel and concrete
-Nurses, keepers and attendants on lunatics
-Warehouse - Godowns
-Aircraft manufacturers
-Colleries - Whole Risk (Fiery)
-Engineers - Bridge building
-Saw mill and timber merchants - All employees
-Wire drawers and wire ropes manufacturers
-Dock Pier and wharf construction maintenance
-Ship chandlers and ship stores
-Ship painters engaged in vessels painting
-Dock service undertakings (excluding stevedors)
-Woodware manufacturers and turners
-Lift manufacturers
-Toilet soap makers (where remelting and perfuming are done)
`.trim();

export async function initializeOccupancyCodes(): Promise<void> {
  try {
    // Check if occupancy codes are already populated
    const existingCodes = await storage.getAllOccupancyCodes();
    if (existingCodes.length > 0) {
      console.log(`Found ${existingCodes.length} existing occupancy codes`);
      return;
    }

    // Parse and insert occupancy codes
    const codes = occupancyListRaw
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.startsWith('-'))
      .map(line => line.substring(1).trim()); // Remove the leading dash

    console.log(`Initializing ${codes.length} occupancy codes...`);

    for (const code of codes) {
      await storage.createOccupancyCode({
        code: code,
        description: code
      });
    }

    console.log('Occupancy codes initialized successfully');
  } catch (error) {
    console.error('Failed to initialize occupancy codes:', error);
    throw error;
  }
}

export async function getMasterOccupancyList(): Promise<string[]> {
  const codes = await storage.getAllOccupancyCodes();
  return codes.map(code => code.code);
}
