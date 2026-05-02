import bcrypt from "bcrypt";

const SALT_ROUNDS=10;

export const hashPassword= async (password)=>{

    const hashedPassword = await bcrypt.hash(password,SALT_ROUNDS);
    if(!hashedPassword){
        throw new Error("Failed to hash password");
    }
    return hashedPassword;
};

export const comparePassword= async (password,hashedpassword)=>{
    return await bcrypt.compare(password,hashedpassword);
}