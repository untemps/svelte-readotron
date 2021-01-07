<p align="center">
    A Svelte component to display an estimated reading time
</p>

---

## Usage

### Template

You can customize the Readotron display by using the `template` prop.  
A template is a string with one or more tokens delimited with `%`

#### Avalaible tokens

| Token         | Description                                                                                                      |
| ------------- | ---------------------------------------------------------------------------------------------------------------- |
| `time`        | Estimated reading time (in minutes)                                                                              |

#### Example

```
<Readotron template="Reading Time: %time% minutes"/>
```