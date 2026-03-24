import { useState, useMemo, useEffect, useRef } from "react";
import { Formik, Field } from "formik";
import * as yup from "yup";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "../context/AuthContext.jsx";
import axiosAPI from "../api/axios.js";

const MEAT_OPTIONS = ["chicken", "mutton", "fish", "pork", "beef"];

const COUNTRY_STATE_MAP = {
  India: [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi",
    "Puducherry",
    "Other",
  ],
  USA: [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
    "Other",
  ],
  UK: ["England", "Scotland", "Wales", "Northern Ireland", "Other"],
  Australia: ["New South Wales", "Victoria", "Queensland", "Other"],
};

const FUEL_OPTIONS = {
  bike: ["Petrol", "Electric"],
  car: ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"],
  bus: ["Diesel", "CNG", "Electric"],
  train: ["Electric", "Diesel"],
  "cycle(No CO₂ emission)": [],
};

const habitSchema = yup.object().shape({
  country: yup.string().required("Select your country"),
  state: yup.string().required("Select your state/region"),

  transport: yup.string().required("Select at least one option."),
  vehicle: yup
    .array()
    .of(yup.string())
    .when("transport", {
      is: "yes",
      then: (schema) =>
        schema.min(1, "Select at least one vehicle type.").required(),
    }),

  vehicleFuel: yup.object().when("transport", {
    is: "yes",
    then: (schema) =>
      schema.test(
        "fuel-required",
        "Select fuel type for each selected vehicle",
        function (val) {
          const { vehicle } = this.parent;
          if (!vehicle || vehicle.length === 0) return true;
          if (!val) return false;

          for (const v of vehicle) {
            if (!FUEL_OPTIONS[v] || FUEL_OPTIONS[v].length === 0) continue;
            const f = val[v];
            if (!f || f.trim().length === 0) return false;
          }
          return true;
        },
      ),
  }),

  distance: yup.object().when("transport", {
    is: "yes",
    then: (schema) =>
      schema.test(
        "distance-required",
        "Enter distance for each vehicle",
        function (distObj) {
          const { vehicle } = this.parent;
          if (!vehicle || vehicle.length === 0) return true;
          if (!distObj) return false;

          for (const v of vehicle) {
            const d = distObj[v];
            if (d === undefined || d === "" || isNaN(d) || Number(d) < 0)
              return false;
          }
          return true;
        },
      ),
  }),

  bags: yup.number().min(0).required("Enter number of plastic bags"),
  plasticItems: yup.object().nullable(true),

  electricityNumber: yup.number().min(0).nullable(true),
  electricityText: yup.string().nullable(true),
  electricitySource: yup.string().required(),

  meat: yup.string().required(),
  meatTypes: yup
    .array()
    .of(yup.string())
    .when("meat", {
      is: "yes",
      then: (schema) => schema.min(1, "Select at least one meat type"),
    }),

  meatData: yup.object().when("meat", {
    is: "yes",
    then: (schema) =>
      schema.test(
        "grams-required",
        "Enter grams for each selected meat",
        function (val) {
          const { meatTypes } = this.parent;
          if (!meatTypes || meatTypes.length === 0) return true;
          if (!val) return false;

          for (const m of meatTypes) {
            const grams = val[m];
            if (!grams || grams <= 0 || isNaN(grams)) return false;
          }
          return true;
        },
      ),
  }),
});

const GridMixFetcher = ({ country, state, setFieldValue, currentSource }) => {
  const lastKey = useRef("");

  useEffect(() => {
    if (!country || !state) return;

    const key = `${country}-${state}`;
    if (lastKey.current === key) return;
    lastKey.current = key;

    const fetchMix = async () => {
      try {
        const res = await axiosAPI.post("/api/grid-mix", {
          country,
          state,
        });

        if (res.data.source !== currentSource) {
          setFieldValue("electricitySource", res.data.source);
          console.log("Executed", res.data.source);
        }
      } catch {
        console.error("Grid mix fetch failed");
      }
    };

    fetchMix();
  }, [country, state, currentSource, setFieldValue]);

  return null;
};

function Tracker() {
  const [aiResponse, setAIResponse] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [yes, setYes] = useState(false);
  const [meat, setMeat] = useState(false);
  const { setEmissionDataFn } = useAuth();

  const countries = useMemo(() => Object.keys(COUNTRY_STATE_MAP), []);

  const sendHabits = async (values) => {
    try {
      setLoading(true);
      const res = await axiosAPI.post("/api/ai", values);
      const data = res.data;
      setAIResponse(data.output);
      setEmissionDataFn(data.emissionObj);
    } catch (err) {
      console.error(err);
      setAIResponse("Something went wrong :(");
    } finally {
      setLoading(false);
    }
  };

  const AIResponseModal = ({ aiResponse, isLoading, onClose }) => {
    if (!aiResponse && !isLoading) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
        {/* backdrop */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* modal card */}
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* header */}
          <div className="flex items-center justify-between px-6 py-4 bg-green-500">
            <div className="flex items-center gap-2">
              <span className="text-2xl">♻️</span>
              <h3 className="text-lg font-semibold text-white">
                Your Sustainability Insights
              </h3>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-black font-bold text-sm transition-colors"
            >
              ✕
            </button>
          </div>

          {/* body */}
          <div className="p-6 max-h-[65vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <div className="h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-700 font-medium">
                  Analyzing your footprint...
                </p>
                <p className="text-gray-400 text-sm">
                  Preparing personalized recommendations
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2 mb-4">
                  ✅ Based on your daily activities, here are your personalized
                  recommendations
                </p>

                <div className="prose prose-sm max-w-none text-gray-700">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {aiResponse}
                  </ReactMarkdown>
                </div>

                {/* footer */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    🌱 Track daily for better insights
                  </p>
                  <button
                    onClick={onClose}
                    className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className=" min-h-screen w-full bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 py-10 px-4">
      <div className="mt-20 w-full max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600">
            🌍 Daily Sustainability Tracker
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            A gentle guide toward a lighter footprint.
          </p>
        </div>

        {/* Form */}
        <Formik
          initialValues={{
            country: "",
            state: "",
            transport: "",
            vehicle: [],
            vehicleFuel: {},
            distance: {},
            bags: 0,
            plasticItems: {},
            electricityNumber: "",
            electricityText: "",
            electricitySource: "Grid Mix",
            electricityNotes: "",
            appliances: {},
            customApplianceName: "",
            customAppliancePower: "",
            customApplianceHours: 1,
            meat: "",
            meatTypes: [],
            meatData: {},
            wasteKg: "",
            waterLitres: "",
            cookingFuel: "",
          }}
          validationSchema={habitSchema}
          onSubmit={async (values, { resetForm }) => {
            await sendHabits(values);
            resetForm();
            setYes(false);
            setMeat(false);
          }}
        >
          {({ values, errors, touched, handleSubmit, setFieldValue }) => {
            return (
              <form
                onSubmit={handleSubmit}
                className="w-full bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg p-6 sm:p-8 md:p-10"
              >
                <GridMixFetcher
                  country={values.country}
                  state={values.state}
                  currentSource={values.electricitySource}
                  setFieldValue={setFieldValue}
                />

                {/* --- LOCATION CARD */}
                <section className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl mb-8">
                  <h2 className="text-xl font-semibold text-emerald-800 mb-4">
                    📍 Your Location
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Country */}
                    <div>
                      <label className="font-medium text-gray-700">
                        Country
                      </label>
                      <Field
                        as="select"
                        name="country"
                        onChange={(e) => {
                          const selectedCountry = e.target.value;
                          setFieldValue("country", selectedCountry);
                          setFieldValue("state", "");
                        }}
                        className="mt-2 w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Select country</option>
                        {countries.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </Field>
                      {errors.country && touched.country && (
                        <p className="text-red-500 text-sm">{errors.country}</p>
                      )}
                    </div>

                    {/* State */}
                    <div>
                      <label className="font-medium text-gray-700">
                        State / Region
                      </label>
                      <Field
                        as="select"
                        name="state"
                        className="mt-2 w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Select state</option>
                        {(COUNTRY_STATE_MAP[values.country] || []).map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </Field>
                      {errors.state && touched.state && (
                        <p className="text-red-500 text-sm">{errors.state}</p>
                      )}
                    </div>
                  </div>
                </section>

                {/* TRANSPORTATION */}
                <section className="bg-teal-50 border border-teal-100 p-6 rounded-2xl mb-8">
                  <h2 className="text-xl font-semibold text-teal-800 mb-4">
                    🚗 Transportation
                  </h2>

                  <div className="flex gap-6 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Field
                        type="radio"
                        name="transport"
                        value="yes"
                        onClick={() => setYes(true)}
                      />
                      <span className="font-medium text-gray-700">
                        I traveled today(24 hours)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <Field
                        type="radio"
                        name="transport"
                        value="no"
                        onClick={() => {
                          setYes(false);
                          setFieldValue("vehicle", []);
                          setFieldValue("distance", {});
                          setFieldValue("vehicleFuel", {});
                        }}
                      />
                      <span className="font-medium text-gray-700">
                        No travel
                      </span>
                    </label>
                  </div>

                  {yes && (
                    <div className="mt-4 space-y-4">
                      <p className="font-medium text-gray-700">
                        Select vehicles:
                      </p>

                      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {[
                          "bike",
                          "car",
                          "train",
                          "bus",
                          "cycle(No CO₂ emission)",
                        ].map((v) => (
                          <div
                            key={v}
                            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition"
                          >
                            {/* Checkbox */}
                            <label className="flex items-center gap-2 cursor-pointer mb-4">
                              <input
                                type="checkbox"
                                checked={values.vehicle.includes(v)}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  if (checked) {
                                    setFieldValue("vehicle", [
                                      ...values.vehicle,
                                      v,
                                    ]);
                                    setFieldValue(`distance.${v}`, "");
                                    setFieldValue(`vehicleFuel.${v}`, "");
                                  } else {
                                    setFieldValue(
                                      "vehicle",
                                      values.vehicle.filter((x) => x !== v),
                                    );

                                    const updatedDist = { ...values.distance };
                                    delete updatedDist[v];
                                    setFieldValue("distance", updatedDist);

                                    if (FUEL_OPTIONS[v]) {
                                      const updatedFuel = {
                                        ...values.vehicleFuel,
                                      };
                                      delete updatedFuel[v];
                                      setFieldValue("vehicleFuel", updatedFuel);
                                    }
                                  }
                                }}
                              />
                              <span className="capitalize font-medium text-gray-700">
                                {v}
                              </span>
                            </label>

                            {values.vehicle.includes(v) && (
                              <div className="space-y-4">
                                {v !== "cycle(No CO₂ emission)" && (
                                  <div>
                                    {/* Fuel */}
                                    <label className="text-sm text-gray-600">
                                      Fuel Type
                                    </label>
                                    <Field
                                      as="select"
                                      name={`vehicleFuel.${v}`}
                                      className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                                    >
                                      <option value="">Select</option>
                                      {FUEL_OPTIONS[v].map((ft) => (
                                        <option key={ft} value={ft}>
                                          {ft}
                                        </option>
                                      ))}
                                    </Field>
                                  </div>
                                )}

                                {/* Distance */}
                                <div>
                                  <label className="text-sm text-gray-600">
                                    Distance (km)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={values.distance[v] || ""}
                                    onChange={(e) =>
                                      setFieldValue(
                                        `distance.${v}`,
                                        Number(e.target.value),
                                      )
                                    }
                                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Errors */}
                      {errors.vehicle && (
                        <p className="text-red-500 text-sm">{errors.vehicle}</p>
                      )}
                      {errors.vehicleFuel && (
                        <p className="text-red-500 text-sm">
                          {errors.vehicleFuel}
                        </p>
                      )}
                      {errors.distance && (
                        <p className="text-red-500 text-sm">
                          {errors.distance}
                        </p>
                      )}
                    </div>
                  )}
                </section>

                {/* --- PLASTIC USAGE ------------------------------------------------ */}
                <section className="bg-orange-50 border border-orange-100 p-6 rounded-2xl mb-8">
                  <h2 className="text-xl font-semibold text-orange-800 mb-4">
                    🛍️ Plastic Usage
                  </h2>
                  <p className="text-gray-600 mb-4 text-sm">
                    Select the plastic items you used today and enter the
                    quantity for each:
                  </p>

                  <div className="space-y-4">
                    {/* Plastic Bags */}
                    <div className="bg-white p-4 rounded-xl border border-orange-200">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={values.plasticItems?.bags !== undefined}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const newPlasticItems = { ...values.plasticItems };

                            if (checked) {
                              newPlasticItems.bags = {
                                count: 0,
                                type: "Plastic Bags",
                              };
                            } else {
                              delete newPlasticItems.bags;
                            }

                            setFieldValue("plasticItems", newPlasticItems);

                            if (checked) setFieldValue("bags", 0);
                          }}
                          className="w-5 h-5 text-orange-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">
                              Plastic Bags
                            </span>
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                              Shopping/ Carry bags
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Single-use plastic shopping bags, carry bags
                          </p>
                        </div>
                      </label>

                      {values.plasticItems?.bags !== undefined && (
                        <div className="mt-3 pl-8">
                          <label className="text-sm text-gray-600 mb-1 block">
                            Number of plastic bags used:
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={values.plasticItems.bags.count}
                            onChange={(e) => {
                              const newPlasticItems = {
                                ...values.plasticItems,
                              };
                              newPlasticItems.bags.count = Number(
                                e.target.value,
                              );
                              setFieldValue("plasticItems", newPlasticItems);
                              setFieldValue("bags", Number(e.target.value));
                            }}
                            className="w-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Plastic Water Bottles */}
                    <div className="bg-white p-4 rounded-xl border border-orange-200">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            values.plasticItems?.waterBottles !== undefined
                          }
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const newPlasticItems = { ...values.plasticItems };

                            if (checked) {
                              newPlasticItems.waterBottles = {
                                count: 0,
                                type: "Water Bottles",
                                size: "500ml",
                              };
                            } else {
                              delete newPlasticItems.waterBottles;
                            }

                            setFieldValue("plasticItems", newPlasticItems);
                          }}
                          className="w-5 h-5 text-orange-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">
                              Plastic Water Bottles
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              500ml-1L bottles
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Single-use PET water bottles (500ml, 1L, etc.)
                          </p>
                        </div>
                      </label>

                      {values.plasticItems?.waterBottles !== undefined && (
                        <div className="mt-3 pl-8 space-y-3">
                          <div>
                            <label className="text-sm text-gray-600 mb-1 block">
                              Number of water bottles:
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={values.plasticItems.waterBottles.count}
                              onChange={(e) => {
                                const newPlasticItems = {
                                  ...values.plasticItems,
                                };
                                newPlasticItems.waterBottles.count = Number(
                                  e.target.value,
                                );
                                setFieldValue("plasticItems", newPlasticItems);
                              }}
                              className="w-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-600 mb-1 block">
                              Bottle size:
                            </label>
                            <select
                              value={values.plasticItems.waterBottles.size}
                              onChange={(e) => {
                                const newPlasticItems = {
                                  ...values.plasticItems,
                                };
                                newPlasticItems.waterBottles.size =
                                  e.target.value;
                                setFieldValue("plasticItems", newPlasticItems);
                              }}
                              className="w-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            >
                              <option value="250ml">250ml</option>
                              <option value="500ml">500ml</option>
                              <option value="1L">1 Liter</option>
                              <option value="1.5L">1.5 Liters</option>
                              <option value="2L">2 Liters</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Food Packaging */}
                    <div className="bg-white p-4 rounded-xl border border-orange-200">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            values.plasticItems?.foodPackaging !== undefined
                          }
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const newPlasticItems = { ...values.plasticItems };

                            if (checked) {
                              newPlasticItems.foodPackaging = {
                                count: 0,
                                type: "Food Packaging",
                              };
                            } else {
                              delete newPlasticItems.foodPackaging;
                            }

                            setFieldValue("plasticItems", newPlasticItems);
                          }}
                          className="w-5 h-5 text-orange-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">
                              Food Packaging
                            </span>
                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                              Takeaway containers
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Takeaway containers, food wrappers, snack packaging
                          </p>
                        </div>
                      </label>

                      {values.plasticItems?.foodPackaging !== undefined && (
                        <div className="mt-3 pl-8">
                          <label className="text-sm text-gray-600 mb-1 block">
                            Number of food packaging items:
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={values.plasticItems.foodPackaging.count}
                            onChange={(e) => {
                              const newPlasticItems = {
                                ...values.plasticItems,
                              };
                              newPlasticItems.foodPackaging.count = Number(
                                e.target.value,
                              );
                              setFieldValue("plasticItems", newPlasticItems);
                            }}
                            className="w-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Straws & Cutlery */}
                    <div className="bg-white p-4 rounded-xl border border-orange-200">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            values.plasticItems?.strawsCutlery !== undefined
                          }
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const newPlasticItems = { ...values.plasticItems };

                            if (checked) {
                              newPlasticItems.strawsCutlery = {
                                count: 0,
                                type: "Straws & Cutlery",
                              };
                            } else {
                              delete newPlasticItems.strawsCutlery;
                            }

                            setFieldValue("plasticItems", newPlasticItems);
                          }}
                          className="w-5 h-5 text-orange-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">
                              Straws & Plastic Cutlery
                            </span>
                            <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-full">
                              Disposable
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Plastic straws, spoons, forks, knives
                          </p>
                        </div>
                      </label>

                      {values.plasticItems?.strawsCutlery !== undefined && (
                        <div className="mt-3 pl-8">
                          <label className="text-sm text-gray-600 mb-1 block">
                            Number of straws/cutlery items:
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={values.plasticItems.strawsCutlery.count}
                            onChange={(e) => {
                              const newPlasticItems = {
                                ...values.plasticItems,
                              };
                              newPlasticItems.strawsCutlery.count = Number(
                                e.target.value,
                              );
                              setFieldValue("plasticItems", newPlasticItems);
                            }}
                            className="w-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Other Plastic Items */}
                    <div className="bg-white p-4 rounded-xl border border-orange-200">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={values.plasticItems?.other !== undefined}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const newPlasticItems = { ...values.plasticItems };

                            if (checked) {
                              newPlasticItems.other = {
                                count: 0,
                                type: "Other",
                                description: "",
                              };
                            } else {
                              delete newPlasticItems.other;
                            }

                            setFieldValue("plasticItems", newPlasticItems);
                          }}
                          className="w-5 h-5 text-orange-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">
                              Other Plastic Items
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                              Custom
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Plastic wrap, product packaging, etc.
                          </p>
                        </div>
                      </label>

                      {values.plasticItems?.other !== undefined && (
                        <div className="mt-3 pl-8 space-y-3">
                          <div>
                            <label className="text-sm text-gray-600 mb-1 block">
                              Number of items:
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={values.plasticItems.other.count}
                              onChange={(e) => {
                                const newPlasticItems = {
                                  ...values.plasticItems,
                                };
                                newPlasticItems.other.count = Number(
                                  e.target.value,
                                );
                                setFieldValue("plasticItems", newPlasticItems);
                              }}
                              className="w-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-600 mb-1 block">
                              Description:
                            </label>
                            <input
                              type="text"
                              value={values.plasticItems.other.description}
                              onChange={(e) => {
                                const newPlasticItems = {
                                  ...values.plasticItems,
                                };
                                newPlasticItems.other.description =
                                  e.target.value;
                                setFieldValue("plasticItems", newPlasticItems);
                              }}
                              placeholder="e.g., plastic wrap, product packaging"
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  {values.plasticItems &&
                    Object.keys(values.plasticItems).length > 0 && (
                      <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                        <h4 className="font-medium text-orange-800 mb-2">
                          Plastic Usage Summary
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(values.plasticItems).map(
                            ([key, item]) => (
                              <div
                                key={key}
                                className="flex justify-between items-center text-sm"
                              >
                                <span className="text-gray-700">
                                  {item.type}
                                  {item.size && ` (${item.size})`}
                                  {item.description && `: ${item.description}`}
                                </span>
                                <span className="font-semibold text-orange-600">
                                  {item.count}{" "}
                                  {item.count === 1 ? "item" : "items"}
                                </span>
                              </div>
                            ),
                          )}
                          <div className="pt-2 border-t border-orange-200 mt-2">
                            <div className="flex justify-between font-medium">
                              <span className="text-orange-800">
                                Total plastic items:
                              </span>
                              <span className="text-orange-600">
                                {Object.values(values.plasticItems).reduce(
                                  (total, item) => total + item.count,
                                  0,
                                )}{" "}
                                items
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                </section>

                {/* ELECTRICITY CONSUMPTION */}
                <section className="bg-yellow-50 border border-yellow-100 p-6 rounded-2xl mb-8">
                  <h2 className="text-xl font-semibold text-yellow-700 mb-4">
                    ⚡ Electricity Consumption
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-6 mb-6">
                    {/* Source - Auto-detected */}
                    <div>
                      <label className="text-gray-700 font-medium">
                        Electricity Source
                        <span className="text-xs text-gray-400 ml-2">
                          (auto-detected)
                        </span>
                      </label>
                      <Field
                        type="text"
                        name="electricitySource"
                        readOnly
                        value={values.electricitySource}
                        className="mt-2 w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500"
                      ></Field>
                    </div>

                    {/* kWh Input (Alternative) */}
                    <div>
                      <label className="text-gray-700 font-medium">
                        Direct kWh Input (Alternative)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        disabled={
                          values.electricityText.trim().length > 0 ||
                          (values.appliances &&
                            Object.keys(values.appliances).length > 0)
                        }
                        value={values.electricityNumber}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFieldValue(
                            "electricityNumber",
                            value === "" ? "" : Number(value),
                          );
                          if (value !== "") {
                            setFieldValue("electricityText", "");
                            setFieldValue("appliances", {});
                          }
                        }}
                        className="mt-2 w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 disabled:bg-gray-100"
                        placeholder="e.g., 5.5"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use this OR appliance selection below
                      </p>
                    </div>
                  </div>

                  {/* Appliance Selection */}
                  <div className="mb-6">
                    <label className="text-gray-700 font-medium block mb-3">
                      Select Household Appliances
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      {[
                        { name: "Fan", power: 75, unit: "W" },
                        { name: "Light Bulb (LED)", power: 10, unit: "W" },
                        { name: "Refrigerator", power: 150, unit: "W" },
                        { name: "Air Conditioner", power: 1500, unit: "W" },
                        { name: "Television", power: 100, unit: "W" },
                        { name: "Washing Machine", power: 500, unit: "W" },
                        { name: "Microwave", power: 1200, unit: "W" },
                        { name: "Electric Stove", power: 2000, unit: "W" },
                        { name: "Water Heater", power: 4000, unit: "W" },
                        { name: "Computer/Laptop", power: 100, unit: "W" },
                        { name: "Mobile Charger", power: 10, unit: "W" },
                        { name: "Ceiling Fan", power: 75, unit: "W" },
                      ].map((appliance) => (
                        <div
                          key={appliance.name}
                          className="bg-white p-4 rounded-lg border border-gray-200"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={
                                  values.appliances?.[appliance.name] !==
                                  undefined
                                }
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  const newAppliances = {
                                    ...values.appliances,
                                  };

                                  if (checked) {
                                    newAppliances[appliance.name] = {
                                      hours: 1,
                                      power: appliance.power,
                                      unit: appliance.unit,
                                    };
                                  } else {
                                    delete newAppliances[appliance.name];
                                  }

                                  setFieldValue("appliances", newAppliances);
                                  setFieldValue("electricityNumber", "");
                                  setFieldValue("electricityText", "");
                                }}
                                className="w-4 h-4"
                              />
                              <span className="font-medium text-gray-700">
                                {appliance.name}
                              </span>
                            </label>
                            <span className="text-sm text-gray-500">
                              {appliance.power} {appliance.unit}
                            </span>
                          </div>

                          {values.appliances?.[appliance.name] && (
                            <div className="mt-3">
                              <label className="text-sm text-gray-600 block mb-1">
                                Usage Hours (0-24)
                              </label>
                              <select
                                value={values.appliances[appliance.name].hours}
                                onChange={(e) => {
                                  const newAppliances = {
                                    ...values.appliances,
                                  };
                                  newAppliances[appliance.name] = {
                                    ...newAppliances[appliance.name],
                                    hours: Number(e.target.value),
                                  };
                                  setFieldValue("appliances", newAppliances);
                                }}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 text-sm"
                              >
                                {Array.from({ length: 25 }, (_, i) => (
                                  <option key={i} value={i}>
                                    {i} hour{i !== 1 ? "s" : ""}
                                  </option>
                                ))}
                              </select>

                              {/* Calculated kWh */}
                              <div className="mt-2 text-sm">
                                <span className="text-gray-600">
                                  Consumption:{" "}
                                </span>
                                <span className="font-medium">
                                  {(
                                    (appliance.power *
                                      values.appliances[appliance.name].hours) /
                                    1000
                                  ).toFixed(2)}{" "}
                                  kWh
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Custom Appliance Input */}
                    <div className="mt-4">
                      <label className="text-gray-700 font-medium mb-2 block">
                        Add Custom Appliance
                      </label>
                      <div className="flex gap-4">
                        <input
                          type="text"
                          placeholder="Appliance name (e.g., Gaming Console)"
                          value={values.customApplianceName || ""}
                          onChange={(e) =>
                            setFieldValue("customApplianceName", e.target.value)
                          }
                          className="flex-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500"
                        />
                        <input
                          type="number"
                          placeholder="Power (W)"
                          min="1"
                          value={values.customAppliancePower || ""}
                          onChange={(e) =>
                            setFieldValue(
                              "customAppliancePower",
                              Number(e.target.value),
                            )
                          }
                          className="w-32 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500"
                        />
                        <select
                          value={values.customApplianceHours || 1}
                          onChange={(e) =>
                            setFieldValue(
                              "customApplianceHours",
                              Number(e.target.value),
                            )
                          }
                          className="w-32 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500"
                        >
                          {Array.from({ length: 25 }, (_, i) => (
                            <option key={i} value={i}>
                              {i}h
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              values.customApplianceName &&
                              values.customAppliancePower
                            ) {
                              const newAppliances = { ...values.appliances };
                              newAppliances[values.customApplianceName] = {
                                hours: values.customApplianceHours || 1,
                                power: values.customAppliancePower,
                                unit: "W",
                                custom: true,
                              };
                              setFieldValue("appliances", newAppliances);
                              setFieldValue("customApplianceName", "");
                              setFieldValue("customAppliancePower", "");
                              setFieldValue("customApplianceHours", 1);
                              setFieldValue("electricityNumber", "");
                              setFieldValue("electricityText", "");
                            }
                          }}
                          className="px-4 py-3 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Text description */}
                  <div className="mb-4">
                    <label className="text-gray-700 font-medium">
                      Or describe usage in text
                    </label>
                    <Field
                      as="textarea"
                      name="electricityText"
                      rows="2"
                      placeholder="e.g. Fan 8h, Fridge 24h, AC 3h"
                      disabled={
                        values.electricityNumber !== "" ||
                        (values.appliances &&
                          Object.keys(values.appliances).length > 0)
                      }
                      className="mt-2 w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 disabled:bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This will override appliance selection above
                    </p>
                  </div>

                  {/* Additional notes */}
                  <div>
                    <label className="text-gray-700 font-medium">
                      Additional notes (optional)
                    </label>
                    <Field
                      as="textarea"
                      name="electricityNotes"
                      rows="2"
                      className="mt-2 w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500"
                      placeholder="Any additional information about your electricity usage..."
                    />
                  </div>

                  {/* Total Consumption Display */}
                  {values.appliances &&
                    Object.keys(values.appliances).length > 0 && (
                      <div className="mt-4 p-4 bg-yellow-100 border border-yellow-200 rounded-lg">
                        <h4 className="font-medium text-yellow-800 mb-2">
                          Total Consumption
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">
                              Total Appliances:
                            </p>
                            <p className="text-lg font-semibold">
                              {Object.keys(values.appliances).length}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              Estimated Total kWh:
                            </p>
                            <p className="text-lg font-semibold text-green-600">
                              {Object.entries(values.appliances)
                                .reduce((total, [name, data]) => {
                                  return (
                                    total + (data.power * data.hours) / 1000
                                  );
                                }, 0)
                                .toFixed(2)}{" "}
                              kWh
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                </section>

                {/* DIET */}
                <section className="bg-rose-50 border border-rose-100 p-6 rounded-2xl mb-8">
                  <h2 className="text-xl font-semibold text-rose-700 mb-4">
                    🍖 Diet & Meat Consumption
                  </h2>
                  <p>
                    [0.25–1.8 kg CO₂e per 100 g for chicken , for mutton/lamb:
                    roughly ~4 kg CO₂e per 100 g.]
                  </p>
                  <div className="flex gap-6 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Field
                        type="radio"
                        name="meat"
                        value="yes"
                        onClick={() => setMeat(true)}
                      />
                      <span className="font-medium text-gray-700">
                        I ate meat today
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <Field
                        type="radio"
                        name="meat"
                        value="no"
                        onClick={() => {
                          setMeat(false);
                          setFieldValue("meatTypes", []);
                          setFieldValue("meatData", {});
                        }}
                      />
                      <span className="font-medium text-gray-700">No meat</span>
                    </label>
                  </div>

                  {meat && (
                    <>
                      <p className="font-medium text-gray-700 mb-2">
                        Select meat types:
                      </p>

                      <div className="flex flex-wrap gap-3 mb-4">
                        {MEAT_OPTIONS.map((m) => (
                          <label
                            key={m}
                            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 cursor-pointer hover:border-rose-400"
                          >
                            <Field
                              type="checkbox"
                              name="meatTypes"
                              value={m}
                              className="w-4 h-4"
                            />
                            <span className="capitalize font-medium">{m}</span>
                          </label>
                        ))}
                      </div>

                      {/* meat grams */}
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {values.meatTypes.map((m) => (
                          <div key={m}>
                            <label className="block mb-2 font-medium text-gray-700 capitalize">
                              {m} (grams)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={values.meatData?.[m] ?? ""}
                              onChange={(e) =>
                                setFieldValue(
                                  `meatData.${m}`,
                                  Number(e.target.value),
                                )
                              }
                              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500"
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </section>

                {/* OPTIONAL DETAILS */}
                <section className="bg-gray-50 border border-gray-200 p-6 rounded-2xl mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    🔍 Optional Details
                  </h2>
                  <p className="text-gray-600 mb-4">
                    These help improve precision (optional)
                  </p>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="font-medium text-gray-700">
                        Household Waste (kg)
                      </label>
                      <Field
                        type="number"
                        name="wasteKg"
                        min="0"
                        className="mt-2 w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-400"
                      />
                    </div>

                    <div>
                      <label className="font-medium text-gray-700">
                        Water Usage (litres)
                      </label>
                      <Field
                        type="number"
                        name="waterLitres"
                        min="0"
                        className="mt-2 w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-400"
                      />
                    </div>

                    <div>
                      <label className="font-medium text-gray-700">
                        Cooking Fuel Type
                      </label>
                      <Field
                        type="text"
                        name="cookingFuel"
                        placeholder="e.g. LPG, firewood"
                        className="mt-2 w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-400"
                      />
                    </div>
                  </div>
                </section>

                {/* SUBMIT */}
                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 px-10 rounded-full shadow-md hover:shadow-lg transition transform hover:scale-105"
                  >
                    Calculate My Impact 🌱
                  </button>
                </div>
              </form>
            );
          }}
        </Formik>

        {/* AI RESPONSE */}
        {(aiResponse || isLoading) && (
          <AIResponseModal
            aiResponse={aiResponse}
            isLoading={isLoading}
            onClose={() => {
              setAIResponse("");
              setLoading(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Tracker;
