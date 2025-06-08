# commanprompt
GIT REPOSITORY FOR COMMANPROMPT.AI

## Integrating ATProto Private Client

The ATProto Private Client codebase is not included directly in this repository
because the environment used to generate this commit does not have network
access to download the files. To complete the integration:

1. Clone the [ATPROTO-PRIVATE-CLIENT](https://github.com/MYaelMendez/ATPROTO-PRIVATE-CLIENT) repository.
2. Copy its contents into the `atproto-client/` directory in this repository.

After copying, you may commit the files or keep them as a submodule depending
on your workflow.

## Running the Project

The interface is a simple static page. To try it out locally:

1. Open `index.html` directly in your web browser.
2. Alternatively, serve the repository with any static file server, e.g.:
   ```bash
   python3 -m http.server
   ```
   Then navigate to `http://localhost:8000/index.html`.
