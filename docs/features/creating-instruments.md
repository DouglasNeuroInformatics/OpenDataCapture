# Creating Instruments

All instruments are stored within the database and contain the information necessary to render the instrument to the user and validate the data received through the API.

Users with permission to create objects of type `Instrument` may do so through two methods:
1. Through a graphical web-based tool
2. Programmatically using the API

## Creating Forms

### Web-Based Method

Regarding the first method, instructions are provided in the GUI and so are not detailed here. 

### Programmatic Method

For programmatic users, you submit a `POST` request to `/api/v1/instruments/forms` with the necessary body. This is possible in any programming language. Although this is possible in any programming language, it is recommended to use either TypeScript or JavaScript to take advantage of our type definitions. 



However, as the structure of forms can be relatively complex, you can take advantage of our type definitions using TypeScript or JavaScript. 

#### Example

Foo 
## Instrument Structure

An instrument can be construed as an abstract entity with the following properties:
- Title
- Details
- Kind
- Data

All instruments must have a title and a variety of details/metadata (e.g., description, language, version). 
The data property determines the content of the instruments (e.g., in the case of a form, the fields to be completed by the user). The structure of this data is discriminated by the kind of the instrument.

## Form Instrument

If an instrument is a "form", then the data is an array of objects which define the properties of the various fields that make up the form, such as:
- Name
- Label
- Description
- Variant

## Aggregate Instrument

*If an instrument is an "aggregate", then the data is an array of instruments, which may themselves be of any valid kind, with the possible exception of aggregate.*