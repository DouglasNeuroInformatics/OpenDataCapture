# Creating Instruments

All instruments are stored within the database and contain the information necessary to render an instrument to the user. Additional instruments may be added, either through code modification, *or for form-based instruments, through a graphical, web-based tool.*

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