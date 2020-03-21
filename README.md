# Foodie

Foodie is the most delicious command line interface out there. Type in what you want to eat and let foodie find restaurants nearby to satisfy your cravings..

## Installation

Use the package manager [npm](https://www.npmjs.com/) to globally install foodie.

```bash
npm install -g foodie 
```

## Usage

This CLI package uses both the Google Geolocation API and Places API. You will need to go to the credentials section of the Google Cloud Platform. Once there, click the "Create Credentials" button, and select "API Key". This key will be used for both APIs so it must be unrestricted. 

However, should you want to restrict your API key, you will need to create a second one. The package allows for an optional second API key to be incorporated, just make sure the first key is for the Geolocation API and the second is for the Places API. 

If you do not include a second API key, the package will default to the first one and use it for both APIs.

The API key(s) needs to be stored in an `.env` file and use the below formatting.

**example .env file**
```
API_KEY = YOUR_FIRST_API_KEY
API_KEY_2 = YOUR_SECOND_API_KEY (optional)
```
Once this is done, you can now globally install foodie and be able to run the `foodie` command.
```
$ foodie
```
You will then receive a prompt, asking what kind of food you want. 

`What are you hungry for?`

Type in a type of food you are in the mood for, like Chinese, Mexican, sushi, Indian, and more (the search is not case sensitive).

You will then see a dancing 'kirby' (`<('o')>`) that will dance in the command line while you wait for your results are evaluated. When your are returned, you should see a list of restaurants that fall under whatever category you typed into the command line. The restaurants are ordered initially by how close they are to you. The closest restaurants will appear at the bottom of the list. 

After the initial response, you will have the option to further sort your results by price, rating and distance. The price and rating sorter will alternate between cheapest/most expensive and best/worst rated. The distance sorter will always return restaurants in the order of closest to furthest away from your device's geographic location.

Below is an example of use.

**Initial Prompt with Results**

![Initial Prompt](https://i.imgur.com/kY3RiRd.png)

**Initial Sort Options**
![Initial Sort](https://i.imgur.com/F1H7hue.png)

**After Sort by Rating**
![Rating Sort](https://i.imgur.com/iHPkot6.png)
Items are now sorted by rating. Notice how now the rating sort option now reads (worst). If you type in `rating` again it will now sort by worst rated.

**Exit**
![Exit](https://i.imgur.com/yIQnyeB.png)

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)