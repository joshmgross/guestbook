# Guestbook
An Action 🎬 to create a Guestbook 📖✒ in your Repository 📚

## Usage

### Pre-requisites
Create a workflow `.yml` file in your repositories `.github/workflows` directory. An [example workflow](#example-workflow) is available below. For more information, reference the GitHub Help Documentation for [Creating a workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

Create an issue in your repository. Any comment in this issue approved (:+1:) by an authorized user will be added to the guestbook. See https://github.com/joshmgross/guestbook/issues/1 for an example issue.

### Inputs

* `issue` - The issue number to retrieve guestbook entries (required)
* `token` - Authorization token used to interact with the repository and update the guestbook. Defaults to `github.token`
* `approvers` - List of users allowed to approve comments for the guestbook
* `guestbook-path` - File path of the guestbook

### Example Workflow
```yaml
    steps:
    - uses: actions/checkout@v2
    - uses: joshmgross/guestbook@main
      with:
        issue: 1
        approvers: |
          joshmgross
    - name: Update guestbook
      run: |
        if [[ `git status --porcelain` ]]; then
          git config --local user.email "actions@github.com"
          git config --local user.name "${{ github.actor }}"
          git add README.md
          git commit -m "✏ Update guestbook"
          git push
        fi
```

See [main.yml](.github/workflows/main.yml) for a full workflow file example.

In your guestbook markdown file, add comments to denote the start and end of the guestbook. Everything within these comments will be replaced by approved comments from the issue specified.
```md
[@joshmgross](https://github.com/joshmgross) said:
> Hello, this is an informative and useful comment illustrating my thoughts. 🧀
<sup>[src](https://github.com/joshmgross/guestbook/issues/1#issuecomment-645117859)</sup>
```

## Example Guestbook

This guestbook is populated by approved :+1: comments in https://github.com/joshmgross/guestbook/issues/1.

[@joshmgross](https://github.com/joshmgross) said:
> Hello, this is an informative and useful comment illustrating my thoughts. 🧀
<sup>[src](https://github.com/joshmgross/guestbook/issues/1#issuecomment-645117859)</sup>

## Prior Art 🎨

Inspired by [@JasonEtco](https://github.com/JasonEtco)'s [readme-guestbook](https://github.com/JasonEtco/readme-guestbook)
