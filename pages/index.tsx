import React from "react";
import Head from "next/head";
import css from "styled-jsx/css";

import MapComponent from "../components/Map";

const lineList = new Map<
  string,
  {
    connectorLines: string[];
    stopIdentifier: string;
    additionalIdentifiers: string[];
  }
>([
  [
    "tram-tram",
    {
      connectorLines: [],
      stopIdentifier: "tram",
      additionalIdentifiers: []
    }
  ],
  [
    "tfl-rail",
    {
      connectorLines: [],
      stopIdentifier: "tfl-rail",
      additionalIdentifiers: ["g#OSI_5_"]
    }
  ],
  [
    "raillo-overground",
    {
      connectorLines: [],
      stopIdentifier: "london-overground",
      additionalIdentifiers: ["g#OSI_5_"]
    }
  ],
  [
    "dlr-dlr",
    {
      connectorLines: ["OSI_48_"],
      stopIdentifier: "dlr",
      additionalIdentifiers: []
    }
  ],
  [
    "lul-waterloo-city",
    {
      connectorLines: [],
      stopIdentifier: "waterloo-city",
      additionalIdentifiers: []
    }
  ],
  [
    "lul-bakerloo",
    {
      connectorLines: [],
      stopIdentifier: "bakerloo",
      additionalIdentifiers: []
    }
  ],
  [
    "lul-jubilee",
    {
      connectorLines: [],
      stopIdentifier: "jubilee",
      additionalIdentifiers: []
    }
  ],
  [
    "lul-victoria",
    {
      connectorLines: [],
      stopIdentifier: "victoria",
      additionalIdentifiers: []
    }
  ],
  [
    "lul-northern",
    {
      connectorLines: [],
      stopIdentifier: "northern",
      additionalIdentifiers: []
    }
  ],
  [
    "lul-piccadilly",
    {
      connectorLines: [],
      stopIdentifier: "piccadilly",
      additionalIdentifiers: [
        "text#s-910genfcoak_label_2_",
        "path#heathrow-airport_2_"
      ]
    }
  ],
  [
    "lul-central",
    {
      connectorLines: [],
      stopIdentifier: "central",
      additionalIdentifiers: []
    }
  ],
  [
    "lul-hammersmith-city",
    {
      connectorLines: [],
      stopIdentifier: "hammersmith-city",
      additionalIdentifiers: []
    }
  ],
  [
    "lul-circle",
    {
      connectorLines: [],
      stopIdentifier: "circle",
      additionalIdentifiers: []
    }
  ],
  [
    "lul-district",
    {
      connectorLines: [],
      stopIdentifier: "district",
      additionalIdentifiers: []
    }
  ],
  [
    "lul-metropolitan",
    {
      connectorLines: [],
      stopIdentifier: "metropolitan",
      additionalIdentifiers: []
    }
  ]
]);

const useSet = <T extends {}>(
  initialValue: T[]
): [(item: T) => void, (item: T) => void, (item: T) => boolean, () => void] => {
  const [set, setSet] = React.useState(new Set(initialValue));

  const add = (item: T) => setSet(new Set(set).add(item));
  const remove = (item: T) => {
    set.delete(item);
    setSet(new Set(set));
  };
  const clear = () => {
    setSet(new Set([]));
  };
  const has = (item: T) => set.has(item);

  return [add, remove, has, clear];
};

const findLineLabels = (line: string) => {
  if (typeof window === "undefined") {
    return [];
  }

  const { stopIdentifier } = lineList.get(line);

  return [
    ...Array.from(
      document.querySelectorAll(`svg g[data-linestop="${stopIdentifier}"]`)
    ).map(node => {
      const [identifier] = node.getAttribute("id").split("_");

      return identifier;
    }),
    ...Array.from(document.querySelectorAll(`svg rect[id^="${line}"]`)).map(
      node => {
        const [_, identifier] = node.getAttribute("id").split("_");

        return identifier;
      }
    ),
    ...Array.from(document.querySelectorAll(`svg polyline[id^="${line}"]`)).map(
      node => {
        const [_, identifier] = node.getAttribute("id").split("_");

        return identifier;
      }
    ),
    ...Array.from(document.querySelectorAll(`svg g[id^="${line}"]`)).map(
      node => {
        const [_, identifier] = node.getAttribute("id").split("_");

        return identifier;
      }
    )
  ].reduce((acc, identifier) => {
    return [
      ...acc,
      ...Array.from(
        document.querySelectorAll(`text[id^="${identifier}"]`)
      ).map(labelNode => labelNode.getAttribute("id")),
      ...Array.from(
        document.querySelectorAll(`text[id^="s-${identifier}"]`)
      ).map(labelNode => labelNode.getAttribute("id")),
      ...Array.from(
        document.querySelectorAll(`g[id^="${identifier}_label"]`)
      ).map(labelNode => labelNode.getAttribute("id")),
      ...Array.from(
        document.querySelectorAll(`g[id^="s-${identifier}_label"]`)
      ).map(labelNode => labelNode.getAttribute("id"))
    ];
  }, []);
};

const Home = () => {
  const [addActiveLine, removeActiveLine, isLineActive] = useSet<string>([]);

  const lineCss = Array.from(lineList)
    .map(
      ([line, { stopIdentifier, connectorLines, additionalIdentifiers }]) => {
        const labelIdentifiers = findLineLabels(line);
        const displayRule = `display: ${
          isLineActive(line) ? "block" : "none !important;"
        };`;

        return `svg #${line},
      svg g[data-linestop="${stopIdentifier}"],
      svg g[id^="${line}"]
      {
        ${displayRule}
      }

      ${connectorLines
        .map(
          id => `g#${id} {
            ${displayRule}
          }`
        )
        .join("\n")}

      ${additionalIdentifiers
        .map(
          id => `${id} {
            ${displayRule}
          }`
        )
        .join("\n")}
      
      ${labelIdentifiers
        .map(
          id => `
          svg [id^="${id}"] {
            ${displayRule}
          }
          svg [id^="s-${id}_label"] {
            ${displayRule}
          }
      `
        )
        .join("\n")}`;
      }
    )
    .join("\n");

  return (
    <>
      <style global jsx>{`
        ${lineCss}
        body {
          margin: 0;
          font-family: "Hammersmith One";
          font-size: 4.5px;
        }
      `}</style>

      <Head>
        <link
          href="https://fonts.googleapis.com/css?family=Hammersmith+One&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div>
        <aside>
          {Array.from(lineList).map(([line]) => (
            <button
              onClick={() => {
                if (isLineActive(line)) {
                  removeActiveLine(line);
                  return;
                }

                addActiveLine(line);
              }}
              style={{
                backgroundColor: isLineActive(line) ? "green" : "red"
              }}
              key={line}
            >
              {line} {isLineActive(line) ? "T" : "F"}
            </button>
          ))}
        </aside>
        <MapComponent />
      </div>
    </>
  );
};

export default Home;
