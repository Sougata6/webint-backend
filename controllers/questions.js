import { Messages } from "../constants/message.js";
import { sendResponse } from "../lib/utils.js";
import dbService from '../lib/database.js';
import { CATEGORIES_COLL, QUESTIONS_COLL } from "../constants/collections.js";
import { ObjectId } from "mongodb";
import fs from 'fs';
import csv from 'csv-parser';

class QuestionController {

  getQuestionsByCategory = async(req, res) => {
    const { categoryId } = req.query;

    let findBy = {}; //Brings all category wise questions 
    if (categoryId) {
      findBy._id = new ObjectId(categoryId);  //Brings the questions of a particular category
    }

    try {

      const client = await dbService.getClient();
      const questions = await client.collection(CATEGORIES_COLL).aggregate([
        {
          $match: findBy
        },
        {
          $lookup: {
            from: QUESTIONS_COLL,
            localField: '_id',
            foreignField: 'categories',
            as: 'questions'
          }
        }
      ]).toArray();

      return sendResponse(res, 200, true, Messages.DATA_FETCH_SUCCESS, questions);

    } catch (error) {
      console.log(error.toString());
      return sendResponse(res, 500, false, Messages.INTERNAL_SERVER_ERROR);
    }

  }

  addQuestionsInBulk = async (req, res) => {

    if (!req.file) {
      return sendResponse(res, 400, false, Messages.MANDATORY_FIELD_MISSING);
    }
    const questions = [];

    const client = await dbService.getClient();

    try {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
          const categories = row.categories.split(',').map((name) => name.trim());
          questions.push({ text: row.question, categories });
        })
        .on('end', async () => {

          try {
            const allCategories = questions.flatMap(q => q.categories);

            const categoryDocs = await client
              .collection(CATEGORIES_COLL)
              .find({ name: { $in: allCategories } })
              .toArray();

            const categoryMap = categoryDocs.reduce((acc, category) => {
              acc[category.name] = category._id;
              return acc;
            }, {});

            const bulkOps = questions.map(q => {
              const categoryIds = q.categories.map(categoryName => categoryMap[categoryName]);
              return {
                insertOne: {
                  document: {
                    text: q.text,
                    categories: categoryIds
                  }
                }
              };
            });

            if (bulkOps.length > 0) {
              await client.collection(QUESTIONS_COLL).bulkWrite(bulkOps);
            }

            return sendResponse(res, 200, true, Messages.DATA_SAVE_SUCCESS);

          } catch (error) {
            console.log(error.toString());
            return sendResponse(res, 500, false, Messages.INTERNAL_SERVER_ERROR);
          }


        });

    } catch (error) {
      console.log(error.toString());
      return sendResponse(res, 500, false, Messages.INTERNAL_SERVER_ERROR);
    }

  };

}

export default QuestionController;