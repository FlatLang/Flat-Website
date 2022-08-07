import { writable } from "svelte/store";

const docPages = [{
  header: "Class types",
  url: "class-types",
  children: [{
      header: "Classes",
      url: "classes",
      references: ["class-types/traits", "class-types/interfaces"],
      children: []
  }, {
      header: "Interfaces",
      url: "interfaces",
      references: ["class-types/traits", "class-types/classes"],
      children: []
  }, {
      header: "Traits",
      url: "traits",
      references: ["class-types/classes", "class-types/interfaces"],
      children: []
  }]
}, {
  header: "Data structures",
  url: "data-structures",
  references: ["data-structures/lists"],
  children: [{
      header: "Lists",
      url: "lists",
      tooltip: "Fundamental collection datatype",
      references: ["data-structures/arrays"]
  }, {
      header: "Arrays",
      url: "arrays",
      references: ["data-structures/lists"]
  }]
}, {
  header: "Getting started",
  url: "getting-started",
  children: [{
      header: "Configure environment",
      url: "configure-environment",
      controller: "ConfigureEnvironmentController",
      css: "/docs/getting-started/configure-environment.css",
      references: [],
      children: []
  }, {
      header: "Hello world",
      url: "hello-world",
      references: [{
          header: "Downloading flat",
          href: "/download#downloads"
      }, {
          header: "Setting environment variables",
          url: "getting-started/configure-environment"
      }],
      children: []
  }]
}];

function setParent(page) {
    page.children?.forEach((child) => {
        child.parent = page;

        setParent(child);
    });
}

docPages.forEach(setParent);

function getUrl(page) {
    let value = page.url;
    let current = page.parent;

    while (current) {
      value = `${current.url}/${value}`;

      current = current.parent;
    }

    return value;
}

function setPaths(page, prefix) {
    if (prefix) {
        page.path = `${prefix}/${page.url}`;
    } else {
        page.path = page.url;
    }

    page.children?.forEach(p => setPaths(p, page.path));
}

docPages.forEach(page => setPaths(page, ""));

function setHrefs(page, prefix) {
    page.href = `${prefix}/${page.url}`;

    page.children?.forEach(p => setHrefs(p, page.href));
}

docPages.forEach(page => setHrefs(page, "/docs"));

function getDoc(url, page) {
    if (!page) {
        for (let child of docPages) {
            const doc = getDoc(url, child);

            if (doc) {
                return doc;
            }
        }

        return;
    }
    if (getUrl(page) === url) {
        return page;
    }

    if (!page.children) {
        return;
    }

    for (let child of page.children) {
        const doc = getDoc(url, child);

        if (doc) {
            return doc;
        }
    }
}

function updateReferences(page) {
    page.references = page.references
        ?.map((ref) => {
            if (typeof ref === 'string') {
                const doc = getDoc(ref);

                if (!doc) {
                    throw new Error(`Could not find doc '${ref}'`);
                }

                return {
                    header: doc.header,
                    url: doc.path
                }
            }

            return ref;
        })
        ?.map((ref) => {
            if (ref.url) {
                const doc = getDoc(ref.url);

                if (!doc) {
                    throw new Error(`Could not find doc '${ref.url}'`);
                }

                return {
                    ...ref,
                    href: doc.href
                };
            } else {
                return ref;
            }
        });

    page.children?.forEach(updateReferences);
}

docPages.forEach(updateReferences);

function getDocFromPath(path) {
    function searchDocs(page) {
        if (page.path === path) {
            return page;
        }

        if (!page.children) {
            return;
        }

        for (let child of page.children) {
            const doc = searchDocs(child);

            if (doc) {
                return doc;
            }
        }
    }

    for (let child of docPages) {
        const doc = searchDocs(child);

        if (doc) {
            return doc;
        }
    }
}

const currentPage = writable(null);

export { docPages, currentPage, getDocFromPath };