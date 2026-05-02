export const validAuthData=(data)=>{
    if(!data.email || !data.password){
        throw new Error("Email and password are required");
    };
}