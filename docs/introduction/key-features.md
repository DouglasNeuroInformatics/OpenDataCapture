# Key Features

## Data Collection

Our platform is engineered to gather a wide range of data, as outlined in the categories listed below. It is important to note that the parameters within each category are not comprehensive and are subject to change, depending on user feedback. For technical users, these categories correspond directly to MongoDB collections.

### Subjects

When a new subject is registered in the database, the following required data is transmitted to our server:
- First Name
- Last Name
- Sex
- Date of Birth

A variety of additional data is also permitted, including:
- Forward Sortation Area
- Ethnicity
- Gender
- Employment Status
- Marital Status
- First Language

Using the required data described above, we compute a unique identifier for the subject. This identifier is generated using what is known as a cryptographic hash function. A hash function is a mathematical function that takes an input and returns a fixed-size string of characters, which is typically a hexadecimal number. The same input will always produce the same output, but even a small change to the input will produce a very different output.

In our case, we use an algorithm called SHA-256 which creates a 256-bit (32-byte) hash value. This is considered a "strong" hash function because it's computationally infeasible to produce two different messages that have the same hash value (collision resistance) and it's also computationally infeasible to recreate the original message from its hash value (pre-image resistance). There are 1.158 x 10^77 possible combinations. For reference, this value is approaching the total number of atoms in the entire observable universe (10^78 to 10^82).

To illustrate how this process works, suppose we have the following information:

| Variable Name | Value       |
| ------------- | ----------- |
| First Name    | René        |
| Last Name     | Tremblay    | 
| Date of Birth | 1980-01-01  | 
| Sex           | Female      | 

Before adding this information to our database, we thoroughly validate and process the provided inputs. Specifically, we standardize the format of first and last names by converting any accented Latin characters to their non-accented ASCII equivalent and capitalizing all characters. Non-Latin characters are not accepted and the user must provide a Latin representation of the name. Additionally, we verify that the date of birth adheres to the ISO 8601 standard and that the sex field is accurately filled with "Male" or "Female". 

If the inputs appear to be valid, the inputs are concatenated together alongside a private key, which is an additional string of characters that is stored in the memory of our server. This is done to prevent an adversary from determining if an individual is in the database, in the unlikely event of a data breach.

| Input                               | Output                                                           |
| ----------------------------------- | ---------------------------------------------------------------- |
| RENE_TREMBLAY_1980-01-01_Female_FOO | 70c7a252fe82c829c08a8f26377dc600c18966eff2a294e724863480559561fc |

This output is used as the identifier for René Tremblay. If René consents for her identity to be stored in our database, then all of the information provided is stored in the database, in addition to this hash. Otherwise, her first and last name are not entered into the database, and we store her date of birth and sex, alongside her identifier.

### Instruments

The platform will feature the ability to complete a variety of instruments. An instrument can be construed as an abstract entity with the following properties:

1. Title
2. Details
3. Kind
4. Data

All instruments have the same structure for title, details, and kind. However, the shape (or format) of the data associated with an experiment depends on the value for kind. For example, if an instrument is a "form", then the data is necessarily an array of objects which define the properties of the various fields that make up the form. 

For all instruments, this data is used to define the content that is rendered to the user when they request an instrument. 

## Data Extraction

The platform will allow individuals to extract data for analysis. Initially, data extraction will be offered by request to the DNP. Later, time-permitting, alternative methods may be implemented. 

## Data Visualization

A visualization dashboard will be implemented to summarize all patients consenting to be included in research. The exact visualizations implemented will depend on the specific needs of individual clinics. In addition, all clinics will be offered an internal dashboard including patients not consenting to inclusion in research.
