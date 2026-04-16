import { registerUser,loginUser } from "../services/auth.service.js";

export const register= async (req,res)=>{
    try{
        const user =await registerUser(req.body);
        res.status(201).json(user);
    }catch(err){
        res.status(400).json({error:err.message});
    }
};


export const login=async (req,res)=>{
    try{
        const user = await loginUser(req.body);
        res.status(200).json(user);
    }catch(err){
        res.status(400).json({error:err.message});
    }
}