# Subject Registration

Before administering any instruments, subjects must be registered in our database. This entails completing a  form with a number of required and optional fields.

## Required Data

- First Name
- Last Name
- Sex
- Date of Birth

> **Important Note:** Although first and last name are required to be transmitted to our server in order to compute a unique ID, these data are never stored in our database without the subject's explicit consent. Instead, we use a one-way hashing function to compute this ID, a method that is currently employed by the NIH for a [similar purpose](https://nda.nih.gov/nda/using-the-nda-guid.html). This process is described in detail below.

> **Potential Change:** We recently learned that all patients at the Douglas have a hospital ID. This may be used and hashed in the future, rather than the above data.

## Optional Data

- Forward Sortation Area
- Ethnicity
- Gender
- Employment Status
- Marital Status
- First Language

## Unique Identifier

### What is a Hash?

A hash function is a mathematical function that takes an input and returns a fixed-size string of characters, which is typically a hexadecimal number. The same input will always produce the same output, but even a small change to the input will produce a very different output.

In our case, we use an algorithm called SHA-256 which creates a 256-bit (32-byte) hash value. This is considered a "strong" hash function because it's computationally infeasible to produce two different messages that have the same hash value (collision resistance) and it's also computationally infeasible to recreate the original message from its hash value (pre-image resistance). For reference, the total number of possible combinations is 1.158 x 10^77, which is a value that approaches the estimated number of atoms in the observable universe, which ranges from 10^78 to 10^82. 

### Example

To illustrate how this process works, suppose we have the following information:

| Variable Name | Value      |
| ------------- | ---------- |
| First Name    | René       |
| Last Name     | Tremblay   |
| Date of Birth | 1980-01-01 |
| Sex           | Female     |

Before adding this information to our database, we thoroughly validate and process the provided inputs. Specifically, we standardize the format of first and last names by converting any accented Latin characters to their non-accented ASCII equivalent and capitalizing all characters. Non-Latin characters are not accepted and the user must provide a Latin representation of the name. Additionally, we verify that the date of birth adheres to the ISO 8601 standard and that the sex field is accurately filled with "Male" or "Female".

If the inputs appear to be valid, the inputs are concatenated together alongside a private key, which is an additional string of characters that is stored in the memory of our server. This is done to prevent an adversary from determining if an individual is in the database, in the unlikely event of a data breach.

<table>
<tr>
    <td style="font-weight: bold; width: 100%;">Input</td>
    <td>RENE_TREMBLAY_1980-01-01_Female_FOO</td>
</tr>
<tr>
    <td style="font-weight: bold; width: 100%;">Output</td>
    <td>70c7a252fe82c829c08a8f26377dc600c18966eff2a294e724863480559561fc</td>
</tr>
</table>

This output is used as the identifier for René Tremblay. If René consents for her identity to be stored in our database, then all of the information provided is stored in the database, in addition to this hash. Otherwise, her first and last name are not entered into the database, and we store her date of birth and sex, alongside her identifier.