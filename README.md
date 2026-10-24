# gta-v-labels

Toolset for extracting labels from GTA V installation. (All languages)

## Dependency

* Grand Theft Auto V
* [rage-cli](https://github.com/VIRUXE/rage-cli)
* [bun](https://bun.com)

## Usage

### Config

Assign GTA installation path to envar `GTA_ROOT`. Overwrite order written in `list_out.txt`. Newly added DLCs should be appended to `list_out.txt` or otherwise it will be ignored when merging.

### Run

Extract:

```bash
$ ./extract.sh
```

Convert:

```bash
$ bun convert.js
```

Merge:

```bash
$ bun merge.js
```

## Credits

* [root-cause/v-labels](https://github.com/root-cause/v-labels) for text keys.

## LICENSE

This project is distributed under [MIT](LICENSE) license.
