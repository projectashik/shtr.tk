#!/usr/bin/env node

import cac from "cac";
import Conf from "conf";
import chalk from "chalk";
import axios from "axios";
import clipboardy from "clipboardy";

const cli = cac("shtr");
const config = new Conf();

cli
  .command(
    "set-apikey <apikey>",
    "Set and store Shtr API key for shortening links from CLI."
  )
  .action((apikey: string) => {
    config.set("shtr-apikey", apikey.toString());
    console.log(
      chalk.green("API key is set 🎉, go ahead and start shortening links now")
    );
  });

cli
  .command(
    "get-apikey",
    `Get the Shtr. API key that has been stored locally. Run ${chalk.bgBlue(
      "$ shtr set-apikey <apikey>"
    )} to set one. Get it from the Shtr dashboard`
  )
  .action(() => {
    console.log("API key: " + chalk.bold.red(config.get("shtr-apikey")));
  });

cli
  .command(
    "set-app-url <app-url>",
    "Set the URL of your self hosted Shtr. instance."
  )
  .action((appUrl: string) => {
    config.set("shtr-url", appUrl.toString());
    console.log(appUrl);
    console.log(
      chalk.green("Base URL is set 🎉, go ahead and start shortening links now")
    );
  });

cli
  .command(
    "show-config",
    "View the current config - Shtr. instance URL and API key"
  )
  .action(() => {
    const appUrl = config.get("shtr-url");
    const apiKey = config.get("shtr-apikey");
    console.log(`App Url: ${chalk.blue(appUrl)}
API Key: ${chalk.green(apiKey)}`);
  });

cli
  .command("shorten <link>", "Shorten links from CLI 🎉")
  .action((link: string) => {
    const appUrl = config.get("shtr-url") as string;
    const apiKey = config.get("shtr-apikey") as string;
    const apiUrl = appUrl.endsWith("/")
      ? `${appUrl}api/v1/link/create`
      : `${appUrl}/api/v1/link/create`;

    axios
      .post(
        apiUrl,
        {
          url: link,
        },
        {
          headers: {
            "api-key": apiKey,
          },
        }
      )
      .then(
        ({
          data,
        }: {
          data: {
            link_id: string;
            user_id: string;
            url: string;
            slug: string;
            password: string;
          };
        }) => {
          const shortUrl = appUrl.endsWith("/")
            ? `${appUrl}${data.slug}`
            : `${appUrl}/${data.slug}`;

          clipboardy.writeSync(shortUrl);
          console.log(
            chalk.green(
              "URL successfully shortened. Copied to clipboard too ;)"
            )
          );
          console.log(chalk.blue(shortUrl));
        }
      )
      .catch((error: Error) => {
        console.log(chalk.red(error.message));
        process.exit(1);
      });
  });

cli.help();
cli.parse();
