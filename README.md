# @emico/eslint-config

This package includes the shareable ESLint configuration used in all SPA-related Emico projects.

## Usage

To use this configuration first install this package:

```sh
yarn add -D @emico/eslint-config
```

Then add this to your `package.json`:

```json
    "eslintConfig": {
        "extends": "@emico/eslint-config"
    },
```

The `eslintConfig` property is used by create-react-app, IDE extensions and seems to be [standard](https://eslint.org/docs/user-guide/configuring).

## Customization

Customization is not recommended as all Emico projects should use the same configuration. Please consider making a pull request to this package instead.

To apply custom rules remove the eslint configuration from your `package.json`, then create a file named `.eslintrc.json` with following contents in the root folder of your project:

```json
{
  "extends": "@emico/eslint-config"
}
```

That's it! You can override the settings by editing the `.eslintrc.json` file. Learn more about [configuring ESLint](http://eslint.org/docs/user-guide/configuring) on the ESLint website.
