import { GoogleGenerativeAI } from "@google/generative-ai";
import { gridMixCache } from "../utils/gridMixCache.js";
import { DailyEmission } from "../models/DailyEmission.js";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

function extractJSON(text) {
  const start = text.indexOf("{");
  if (start === -1) {
    throw new Error("No JSON start found");
  }

  let braceCount = 0;
  let end = -1;

  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") braceCount++;
    else if (text[i] === "}") braceCount--;

    if (braceCount === 0) {
      end = i;
      break;
    }
  }

  if (end === -1) {
    throw new Error("JSON not properly closed");
  }

  const jsonString = text.slice(start, end + 1);
  return JSON.parse(jsonString);
}

function splitAIResponse(text) {
  const machineData = extractJSON(text);

  const userText = text
    .replace(/SECTION 2: MACHINE_READABLE_DATA[\s\S]*/i, "")
    .replace(machineData ? JSON.stringify(machineData, null, 2) : "", "")
    .replace(
      /[-─]{3,}\s*\n?SECTION 1[:\s]*USER[_\s]FRIENDLY[_\s]REPORT\s*\n?[-─]{3,}/gi,
      "",
    )
    .replace(/SECTION 1[:\s]*USER[_\s]FRIENDLY[_\s]REPORT/gi, "")
    .trim();

  return {
    userText,
    machineData,
  };
}

export const gridMix = async (req, res) => {
  try {
    let { country, state } = req.body;

    if (
      typeof country !== "string" ||
      typeof state !== "string" ||
      country.length > 60 ||
      state.length > 60
    ) {
      return res.json({ source: "Grid Mix" });
    }

    country = country.trim();
    state = state.trim();

    const key = `${country.toLowerCase()}-${state.toLowerCase()}`;

    if (gridMixCache.has(key)) {
      return res.json({ source: gridMixCache.get(key) });
    }

    const prompt = `
You are an energy infrastructure expert.

Identify the dominant electricity generation source for this region:

Country: ${country}
State/Region: ${state}

Return ONLY a short energy source name (1–3 words).
Examples:
Coal
Hydropower
Wind
Solar
Natural Gas
Nuclear
Geothermal
Biomass
Oil
Mixed Grid

Rules:
- No explanations
- No sentences
- No punctuation
- If uncertain, return: Mixed Grid
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const result = await model.generateContent(prompt);
    clearTimeout(timeout);

    let source = result.response.text().trim();

    source = source
      .replace(/[^a-zA-Z\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!source || source.length > 30) {
      source = "Mixed Grid";
    }

    gridMixCache.set(key, source);

    res.json({ source });
    console.log(source);
  } catch (err) {
    console.error("Grid mix error:", err.message);
    res.json({ source: "Mixed Grid" });
  }
};

export const analyzeAI = async (req, res) => {
  try {
    const {
      country,
      state,
      transport,
      vehicle,
      distance,
      vehicleFuel,
      bags,
      plasticItems,
      electricityNumber,
      electricityText,
      electricitySource,
      electricityNotes,
      appliances,
      customApplianceName,
      customAppliancePower,
      customApplianceHours,
      meat,
      meatTypes,
      meatData,
      wasteKg,
      waterLitres,
      cookingFuel,
    } = req.body;

    const travelDetails =
      transport === "yes"
        ? Object.keys(distance)
            .map(
              (v) =>
                `${distance[v]} km using ${v} (${
                  vehicleFuel[v] || "unknown fuel"
                })`,
            )
            .join(" and ")
        : "User did not travel using any vehicle";

    const meatConsumption =
      meat === "yes"
        ? Object.keys(meatData)
            .map((m) => `${meatData[m]}g of ${m}`)
            .join(" and ")
        : "User says they did not consume meat today";

    let applianceDetails = "";
    if (appliances && Object.keys(appliances).length > 0) {
      const applianceList = Object.entries(appliances).map(([name, data]) => {
        const powerW = data.power;
        const hours = data.hours;
        const estimatedKwh = ((powerW * hours) / 1000).toFixed(2);
        return `${name}: ${powerW}W used for ${hours} hour${hours !== 1 ? "s" : ""} (est. ${estimatedKwh} kWh)`;
      });
      applianceDetails = `Appliance usage:\n${applianceList.join("\n")}`;
    }

    let electricityInfo = "";
    if (electricityNumber !== "") {
      electricityInfo = `${electricityNumber} kWh consumed (Source: ${electricitySource})`;
    } else if (appliances && Object.keys(appliances).length > 0) {
      const totalKwh = Object.entries(appliances)
        .reduce((total, [name, data]) => {
          return total + (data.power * data.hours) / 1000;
        }, 0)
        .toFixed(2);
      electricityInfo = `Appliance-based usage: ${totalKwh} kWh total from selected appliances (Source: ${electricitySource})`;

      if (applianceDetails) {
        electricityInfo += `\n${applianceDetails}`;
      }
    } else if (electricityText.trim().length > 0) {
      electricityInfo = `Appliance usage reported: ${electricityText} (Source: ${electricitySource})`;
    } else {
      electricityInfo = `No electricity usage specified (Source: ${electricitySource})`;
    }

    if (customApplianceName && customAppliancePower) {
      const customApplianceInfo = `Custom appliance: ${customApplianceName}, Power: ${customAppliancePower}W, Hours: ${customApplianceHours || 1}`;
      electricityInfo += `\n${customApplianceInfo}`;
    }
    let plasticDetails = "";
    let totalPlasticItems = 0;

    if (plasticItems && Object.keys(plasticItems).length > 0) {
      const plasticList = Object.entries(plasticItems).map(([key, item]) => {
        totalPlasticItems += item.count;
        let itemDetails = `${item.count} ${item.type.toLowerCase()}`;

        if (item.size) {
          itemDetails += ` (${item.size})`;
        }
        if (item.description) {
          itemDetails += ` - ${item.description}`;
        }

        return itemDetails;
      });

      plasticDetails = `Detailed plastic usage:\n${plasticList.join("\n")}\nTotal plastic items: ${totalPlasticItems}`;
    }

    const plasticInfo = plasticDetails
      ? `Plastic Usage:\n${plasticDetails}`
      : `Plastic bags used: ${bags || 0}`;

    const optionalData = `
Optional CO₂ precision data:
Household Waste: ${wasteKg || "not provided"} kg  
Water Usage: ${waterLitres || "not provided"} litres  
Cooking Fuel Used: ${cookingFuel || "not provided"}  
`.trim();

    const prompt = `
You are an AI sustainability analyst.

The user has submitted their daily sustainability details.

Location:
Country: ${country}
State/Region: ${state}

Transport:
${travelDetails}

${plasticInfo}

Electricity Usage:
${electricityInfo}
${electricityNotes ? `Additional notes: ${electricityNotes}` : ""}

Diet:
${meatConsumption}

${optionalData}

Your task is to analyze the above information and respond in EXACTLY TWO SECTIONS, in the order specified below.

────────────────────────────────
SECTION 1: USER_FRIENDLY_REPORT
────────────────────────────────
• Estimate the user's daily CO₂ footprint using the provided numerical values and make the "section 1" as heading and highlight it.
• Do NOT perform any new calculations.
• Do NOT recompute totals.
• Use the numbers exactly as given.
• Provide a clear, well-structured breakdown by category:
  - Transport
  - Electricity
  - Diet
  - Plastic/Waste
• Use realistic and commonly accepted emission factors.
• Clearly explain assumptions where needed.
• Include **5 beautifully formatted bullet-point suggestions** to help reduce the carbon footprint.
• This section may contain explanations, formatting, and natural language.
• Do NOT include JSON or machine-readable data in this section.

SECTION 2: MACHINE_READABLE_DATA

• Return ONLY valid JSON.
• Do NOT include headings, separators, bullet points, markdown, or explanatory text.
• Do NOT include any characters before or after the JSON.
• Do NOT wrap the JSON in code fences.
• 
• The output MUST start with '{' and end with '}'.
• 
• All values must be numbers only (no units, no symbols, no text).
• Units are implicitly kilograms of CO₂ equivalent (kg CO₂e).
• If a category is not applicable, return 0.
• 
• The JSON MUST have all required opening and closing braces.
• The root object MUST be properly closed.
• The JSON MUST be valid when passed directly into JSON.parse().

Use EXACTLY the following JSON structure:

{
  "totalEmission": {
    "transport": {
      "bike": number,
      "car": number,
      "train": number,
      "bus": number,
    },
    "electricity": number,
    "diet": number,
    "plasticWaste": number,
    "householdWastage": number,
    "water": number,
    "cookingFuel": number,
    "overall": number
  }
}

IMPORTANT RULES:
• The "overall" value must equal the sum of all other categories.
• Do not rename, reorder, or add fields.
• Ensure numerical accuracy and consistency.
• Any violation of this structure is considered an error.

Begin your response now.

`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const aiText = result.response.text();
    const { userText, machineData } = splitAIResponse(aiText);

    if (!machineData || !machineData.totalEmission) {
      return res.status(500).json({ error: "Invalid AI response format" });
    }

    const todayDate = new Date().toLocaleDateString("en-CA");

    await DailyEmission.updateOne(
      { userId: req.user.id, date: todayDate },
      {
        $setOnInsert: {
          userId: req.user.id,
          date: todayDate,
          createdAt: new Date(),
          totals: {
            transport: { bike: 0, car: 0, bus: 0, train: 0 },
            electricity: 0,
            diet: 0,
            plasticWaste: 0,
            householdWastage: 0,
            water: 0,
            cookingFuel: 0,
            overall: 0,
          },
        },
      },
      { upsert: true },
    );

    await DailyEmission.updateOne(
      { userId: req.user.id, date: todayDate },
      {
        $inc: {
          "totals.transport.bike":
            machineData.totalEmission.transport.bike || 0,
          "totals.transport.car": machineData.totalEmission.transport.car || 0,
          "totals.transport.bus": machineData.totalEmission.transport.bus || 0,
          "totals.transport.train":
            machineData.totalEmission.transport.train || 0,
          "totals.electricity": machineData.totalEmission.electricity || 0,
          "totals.diet": machineData.totalEmission.diet || 0,
          "totals.plasticWaste": machineData.totalEmission.plasticWaste || 0,
          "totals.householdWastage":
            machineData.totalEmission.householdWastage || 0,
          "totals.water": machineData.totalEmission.water || 0,
          "totals.cookingFuel": machineData.totalEmission.cookingFuel || 0,
          "totals.overall": machineData.totalEmission.overall || 0,
        },
        $set: { updatedAt: new Date() },
      },
    );

    res.json({ output: userText, emissionObj: machineData.totalEmission });
  } catch (error) {
    console.error("Error processing AI request:", error);
    return res.status(500).json({ error: "AI request failed" });
  }
};

export const getEmission = async (req, res) => {
  try {
    const { period } = req.query;

    const data = await DailyEmission.findOne({
      userId: req.user.id,
      date: period,
    });

    if (!data) return res.json({ emission: null, datePeriod: period });

    res.json({ emission: data.totals, datePeriod: period });
  } catch (err) {
    console.error("Emission fetch error:", err);
    res.sendStatus(500);
  }
};

export const analyzeEmission = async (req, res) => {
  try {
    const {
      date,
      overallEmission,
      transportEmission,
      otherEmissions,
      totalPlasticItems,
      electricityConsumption,
      dietEmission,
    } = req.body;

    const prompt = `
You are an AI sustainability analyst. Analyze the user's carbon emission data and provide detailed insights.

Date: ${date}

Overall Emission: ${overallEmission.toFixed(2)} kg CO₂e

Transportation Emissions:
${Object.entries(transportEmission)
  .map(([vehicle, value]) => `  - ${vehicle}: ${value.toFixed(2)} kg CO₂e`)
  .join("\n")}

Other Emissions:
${Object.entries(otherEmissions)
  .map(([category, value]) => `  - ${category}: ${value.toFixed(2)} kg CO₂e`)
  .join("\n")}

Key Metrics:
- Total Plastic Items: ${totalPlasticItems}
- Electricity Consumption: ${electricityConsumption.toFixed(2)} kg CO₂e
- Diet Emission: ${dietEmission.toFixed(2)} kg CO₂e

Provide a comprehensive analysis with:
1. **Overall Assessment**: Brief summary of their carbon footprint
2. **Major Contributors**: Identify top 3 emission sources
3. **Comparison to Averages**: Compare with typical daily averages
4. **Trend Analysis**: Identify patterns in their data
5. **Personalized Recommendations**: 3-5 actionable steps to reduce emissions
6. **Goal Setting**: Suggest realistic reduction targets

Format the response in a clear, structured manner with bullet points and emphasis on key areas for improvement. Be encouraging but honest about areas needing attention.

Make the analysis practical, actionable, and tailored to their specific emission pattern.
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    res.json({ analysis });
  } catch (error) {
    console.error("Error generating analysis:", error);
    res.status(500).json({ error: "Failed to generate analysis" });
  }
};
