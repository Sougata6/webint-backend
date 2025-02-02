import {MongoClient} from  'mongodb';
import { DB_NAME } from "../constants/collections.js";
import dotenv from 'dotenv';
dotenv.config();

dotenv.config();

function dbService() {

	let client = null;
	const url = process.env.DB_URL || "mongodb://localhost:27017"

	async function getClient() {

		if (client)
			return client.db(DB_NAME);

		client = new MongoClient(url);

		await client
			.connect()
			.then(() => console.log('Database connected successfully!'))
			.catch((err) => console.log('Database connection error: ', err.toString()));

		return client.db(DB_NAME);
	}

	return { getClient };
}

export default dbService();
