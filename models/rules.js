// models/tasaRango.js
const { Schema, model } = require('mongoose');

const variableSchema = new Schema({
    name: String,
    description: String,
    type: String,
    isOutput: Boolean
});

const conditionSchema = new Schema({
    name: String,
    operator: String,
    begin: Number,
    end: Number,
    value: String
});

const resultSchema = new Schema({
    name: String,
    value: Number
});

const ruleSchema = new Schema({
    conditions: [conditionSchema],
    results: [resultSchema]
})

const rulesSchema = new Schema({
    name: String,
    description: String,
    variables: [variableSchema],
    rules: [ruleSchema]
});

const Rule = model('Rule', rulesSchema);

module.exports = Rule;
