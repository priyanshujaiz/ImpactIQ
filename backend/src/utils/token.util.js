import jwt from "jsonwebtoken";

export const generateToken= async (playload)=>{

    if(!process.env.JWT_SECRET){
        throw new Error("JWT_SECRET is not configured right now");
    }

    return jwt.sign({
        id:playload.id,
        email:playload.email,
        role:playload.role,
    },process.env.JWT_SECRET,
    {
        expiresIn:"7d"
    }
    );
}