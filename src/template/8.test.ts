interface IPropertyDefinition {
  value: any;
  type: "required" | "optional";
}

interface IPropertyMap {
  name: string;
  properties: { [key: string]: IProperty };
}

const generateRestClientCode = (propertyMap: IPropertyMap) => {
  const entityName = propertyMap.name.toLowerCase();
  const baseUrl = `http://localhost:3000/v1/${entityName}`;

  const postPayload = Object.keys(propertyMap.properties)
    .filter((key) => propertyMap.properties[key].type === "required")
    .reduce((acc, key) => {
      acc[key] = propertyMap.properties[key].value;
      return acc;
    }, {} as Record<string, any>);

  const putPayload = Object.keys(propertyMap.properties).reduce((acc, key) => {
    acc[key] = key === "Id" ? 5 : `${propertyMap.properties[key].value}0`;
    return acc;
  }, {} as Record<string, any>);

  return `
POST ${baseUrl}
Content-Type: application/json
tenantid: tenanta
traceparent: 12345
Authorization: bearer Token

${JSON.stringify(
  {
    ...postPayload,
  },
  null,
  2
)}

####
GET ${baseUrl}/5
Content-Type: application/json
tenantid: tenanta
traceparent: 12345
Authorization: bearer Token

####
PUT ${baseUrl}/5
Content-Type: application/json
tenantid: tenanta
traceparent: 12345
Authorization: bearer Token

${JSON.stringify(
  {
    Id: 5,
    ...putPayload,
  },
  null,
  2
)}

####
DELETE ${baseUrl}/4
Content-Type: application/json
tenantid: tenanta
traceparent: 12345
Authorization: bearer Token
`;
};
