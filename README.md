
# json-to-openapi

This is a JSON to OpenAPI Generator tool, based on [SwagDefGen](https://github.com/Roger13/SwagDefGen), to quickly convert from JSON object to OpenAPI schema definition, very helpful when working with Swagger.

* Supports all openAPI types
* Detects `int32` and `int64` formats
  * Added unsafe format to integers that use more than 64 bits
* Detects date and date-time formats according to [ISO 8601](https://xml2rfc.tools.ietf.org/public/rfc/html/rfc3339.html#anchor14)
* Allows nested objects and arrays
* Supports nullable fields
* Adds mock values as examples for all types
* Output is in YAML format
* Ignores comments starting with `//` in the input text area
* If type `string` is detected the example will be surrounded with ""
* Adds property `required` in the openAPI schema
* openAPI schema starts by default with:
  ```
  schema: 
    type: object
    properties: 
  ```
* Detects `double` and `float` formats for type number
  * Added unsafe format when numbers uses more than 16 decimals


## Limitation
This was a quickly build project to fulfill the demand of building response example for SwaggerHub, which means it's not 100% perfect.

 - Doesn't use the comment on JSON object to create description
 - Example from number type might not be accurate

This being said, it's still recommended to double check the output.
This limitations might be improved in the future, but not plan for now.
