type PropertyType = "required" | "optional";

interface IProperty {
  value: string | number | boolean | object | null; // Extendable for more types
  type: PropertyType;
}

interface IPropertyMap {
  name: string; // Name of the interface
  properties: { [key: string]: IProperty }; // Properties of the interface
}

function createModelFromObjectMap(propertyMap: IPropertyMap): string {
  const { name, properties } = propertyMap;

  let interfaceString = `export interface ${name} {\n`;

  for (const [key, { value, type }] of Object.entries(properties)) {
    const optionalFlag = type === "optional" ? "?" : "";
    let valueType: string;

    // Determine the TypeScript type
    if (value === null) {
      valueType = "any"; // Null is considered any
    } else if (Array.isArray(value)) {
      valueType = "any[]"; // Arrays are typed as any[]
    } else {
      valueType = typeof value;
    }

    interfaceString += `  ${key}${optionalFlag}: ${valueType};\n`;
  }

  interfaceString += `}`;
  return interfaceString;
}

// Example usage
const propertyMap: IPropertyMap = {
  name: "Student",
  properties: {
    Id: { value: 123, type: "optional" },
    name: { value: "John Doe", type: "required" },
    adhaar: { value: "1234-5678-9012", type: "required" },
    school: { value: "ABC High School", type: "required" },
    isActive: { value: true, type: "optional" },
    grade: { value: null, type: "optional" }, // Null for unknown or any
    metadata: { value: { age: 16 }, type: "optional" }, // Object
    tags: { value: ["science", "math"], type: "optional" }, // Array
  },
};

const generatedInterface = createModelFromObjectMap(propertyMap);
console.log(generatedInterface);
