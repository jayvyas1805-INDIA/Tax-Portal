export const computeProfileCompletion = (partner) => {
    const items = [
        {
            label: "Personal Information",
            status:
                partner.personalInfo.status === "complete"
                    ? "done"
                    : "pending",
        },
        {
            label: "Professional Information",
            status:
                partner.professionalInfo.status === "complete"
                    ? "done"
                    : "pending",
        },
        {
            label: "Address Information",
            status:
                partner.addressInfo.status === "complete"
                    ? "done"
                    : "pending",
        },
        {
            label: "KYC Verification",
            status:
                partner.kycInfo.status === "complete"
                    ? "done"
                    : "pending",
        },
        {
            label: "Bank Details",
            status:
                partner.bankingInfo.status === "complete"
                    ? "done"
                    : "pending",
        },
        {
            label: "Agreement",
            status:
                partner.agreement.status === "complete"
                    ? "done"
                    : "pending",
        },
    ];

    const completed = items.filter(item => item.status === "done").length;

    const percentage = Math.round((completed / items.length) * 100);

    // console.log("Percentage:", percentage);

    return {
        percentage,
        completed,
        total: items.length,
        items,
    };
};