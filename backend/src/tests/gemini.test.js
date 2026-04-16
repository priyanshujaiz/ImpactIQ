import { parseFieldReport } from "../services/gemini.service.js";

const test = async () => {
  const res = await parseFieldReport(
    "Zone Z1 needs urgent medical help, around 200 people affected, severity high, 3 volunteers present"
  );

  console.log(res);
};

test();