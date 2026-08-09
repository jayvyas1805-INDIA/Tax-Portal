import Partner from '../models/Partner.js'

export const abcd = async(req,res) => {
    try {
        const partner = await Partner.findById(req.user.id);

        if(!partner){
            res.status(404).json({
                success: false,
                message: "partner not found"
            })
        }

        const steps = [partner.personalInfo,partner.professionalInfo,partner.addressInfo,partner.kycInfo,partner.bankingInfo,partner.agreement]
        const com = []
        for(const step of steps){
            if(step.status == "complete"){
                com.push(step)
            }
        }

        const percentage = (com.length / 6) * 100;

        res.status(200).json({
            success:true,
            data:com,percentage
        })

    } catch (error) {
    console.error(error);

    res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
}
}