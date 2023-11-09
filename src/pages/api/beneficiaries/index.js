import prisma from "../../../../lib/prisma"

export default async function handle(req, res) {
    // try {
        let getDataApi = await fetch("http://localhost:7701/api/master-v4")
        let data = await getDataApi.json()
        let penampung = 0
        let dataPassingContract = {
            Code                 : '',
            ContractNumber       : '',
            ContractName         : '',
            ContractDescription  : '',
            ContractCreated      : '',
            ContractCompany      : '',
            StartDate            : '',
            EndDate              : '',
            Company              : '',
            ApprovalStatus       : '',
            ActiveContractStatus : '',
            IsActive             : '',
            IsDeleted            : '',
            CreatedAt            : new Date(),
            UpdatedAt            : new Date(),
        }

        let dataPassingWallet = {
            AccountingDays               : "-",
            TaxPercentage                : 0,
            TaxType                      : "-",
            TaxNumber                    : "-",
            TaxExecptionOrSocialSecurity : "-",
            BankAccountEntryType         : "-",
            BankAccountISOTerritory      : "-",
            BankName                     : "-",
            BankAccountHolder            : "-",
            BankSpecialNotes             : "-",
            BankMainSortCode             : "-",
            BankAdditionalSortCode       : "-",
            BankAccountIsIBAN            : "-",
            BankAccountNumber            : "-",
            Bank                         : "-",
            TaxAmount                    : 0,
            NPWP_Number                  : "-",
            Payment_Currency             : "-",
            PaymentStatus                : false,
            FaxNumber                    : "-",
            FrequencyPayment             : "-",
            MinimumPaymentAmount         : 0,
            IsActive                     : false,
            IsDeleted                    : false,
            CreatedAt                    : new Date(),
            UpdatedAt                    : new Date(),
        }

        let dataPassingAddress = {
            Address       : "",
            RT            : "",
            RW            : "",
            KelurahanDesa : "",
            Kecamatan     : "",
            KabupatenKota : "",
            Provinsi      : "",
            Negara        : "",
            KodePos       : "",
            IsActive      : true,
            IsDeleted     : false,
            CreatedAt     : new Date(),
            UpdatedAt     : new Date(),
        }

        let dataPassingAdministration = {
            AdminDeal                           : false,
            AdminDealNetTerms                   : false,
            AdminDealAdministered               : 0,
            AdminDealNetRemainder               : false,
            AdminDealAdministrating             : false,
            ReceivedRate                        : 0,
            EffectiveRate                       : 0,
            AdministrationParticipationDealType : "-",
            IsActive                            : true,
            IsDeleted                           : false,
            CreatedAt                           : new Date(),
            UpdatedAt                           : new Date(),
        }

        // for ( let i = 0; i < 5; i++ ) {
        for ( let i = 0; i < data.data.length; i++ ) {
            dataPassingContract.Code = `${ data.data[i].CODE }`
            dataPassingContract.ContractNumber = data.data[i].CONTRACT_NUMBER
            dataPassingContract.ContractName = data.data[i].NAME
            dataPassingContract.ContractDescription = ""
            dataPassingContract.ContractCreated = data.data[i].START_DATE ? new Date(data.data[i].START_DATE) : null
            dataPassingContract.ContractCompany = ""
            dataPassingContract.StartDate = data.data[i].START_DATE ? new Date(data.data[i].START_DATE) : null
            dataPassingContract.EndDate = data.data[i].END_DATE ? new Date(data.data[i].END_DATE) : null
            dataPassingContract.Company = ""
            dataPassingContract.ApprovalStatus = false
            dataPassingContract.ActiveContractStatus = false
            dataPassingContract.IsActive = true
            dataPassingContract.IsDeleted = false
            dataPassingContract.CreatedAt = new Date()
            dataPassingContract.UpdatedAt = new Date()

            // Step 1 Create Data Contract Beneficiaries
            let createDataContract = await prisma.BeneficiariesContract.create({ data: dataPassingContract })

            // Step 2 Create Data Company / Personal Beneficiaries
            if ( data.data[i].NAME.includes("PT ") || data.data[i].NAME.includes("CV ") ) {
                let dataPassingCompany = {
                    CodeCompany : `${ data.data[i]?.CODE }`,
                    CompanyName : data.data[i]?.NAME,
                    Controlled  : data.data[i]?.CONTROLLED.toLowerCase() === "y" ? true : false,
                    Email       : data.data[i]?.EMAIL,
                    Phonenumber : data.data[i]?.PHONE_NUMBER,
                    StartDate   : data.data[i]?.START_DATE ? new Date(data.data[i]?.START_DATE) : null,
                    EndDate     : data.data[i]?.END_DATE ? new Date(data.data[i]?.END_DATE) : null,
                    IsActive    : true,
                    IsDeleted   : false,
                    CreatedAt   : new Date(),
                    UpdatedAt   : new Date(),
                }

                let createDataCompany = await prisma.BeneficiariesCompany.create({ data: dataPassingCompany })
                
                // Step 3 Create Relation Company & Contract
                let createDatarelationCompany = await prisma.RelationContractAndCompany.create({
                    data: { BCompany_ID: createDataCompany.id, BContract_ID: createDataContract.id, }
                })

                // Step 4 Create Wallet Information
                dataPassingWallet.TaxNumber                    = data.data[i]?.TAX ? data.data[i]?.TAX : "-"
                dataPassingWallet.BankName                     = data.data[i]?.ACCOUNT_NAME
                dataPassingWallet.BankAccountHolder            = data.data[i]?.BRANCH
                dataPassingWallet.BankAccountNumber            = data.data[i]?.ACCOUNT_NUMBER
                dataPassingWallet.Bank                         = data.data[i]?.BANK_NAME
                dataPassingWallet.NPWP_Number                  = data.data[i]?.NPWP

                let createWalletInformation = await prisma.WalletInformation.create({ data: dataPassingWallet })

                let createWalletInformationRelation = await prisma.RelationWalltBeneficiaries.create({
                    data: { BCompany_ID: createDataCompany.id, Wallet_ID: createWalletInformation.id, BPersonal_ID: null }
                })

                // Step 4 Create Address Information
                dataPassingAddress.Address       = data.data[i]?.CORRESPONDENCE_ADDRESS
                dataPassingAddress.RT            = data.data[i]?.C_RT
                dataPassingAddress.RW            = data.data[i]?.C_RW
                dataPassingAddress.KelurahanDesa = data.data[i]?.C_KELURAHAN_OR_DESA
                dataPassingAddress.Kecamatan     = data.data[i]?.C_KECAMATAN
                dataPassingAddress.KabupatenKota = data.data[i]?.C_KOTA_OR_KABUPATEN
                dataPassingAddress.Provinsi      = data.data[i]?.C_PROVINSI
                dataPassingAddress.Negara        = data.data[i]?.C_RT
                dataPassingAddress.KodePos       = data.data[i]?.C_POSTAL_CODE

                let createAddressInformation = await prisma.AddressInformation.create({ data: dataPassingAddress })

                let createAddressInformationRelation = await prisma.RelationAddressBeneficiaries.create({
                    data: { BCompany_ID: createDataCompany.id, Address_ID: createAddressInformation.id, BPersonal_ID: null }
                })

                // Step 5 Create Administration
                dataPassingAdministration.AdminDeal                           = true
                dataPassingAdministration.ReceivedRate                        = data.data[i]?.SHARE
                dataPassingAdministration.EffectiveRate                       = data.data[i]?.SHARE

                let createAdministration = await prisma.BeneficiariesAdministration.create({ data: dataPassingAdministration })

                let createAdministrationRelation = await prisma.RelationAdministrationBeneficiaries.create({
                    data: { BCompany_ID: createDataCompany.id, Administration_ID: createAdministration.id, BPersonal_ID: null }
                })
            } else {
                let dataPassingPersonal = {
                    Code                    : `${ data.data[i]?.CODE }`,
                    Nationality             : "-",
                    ID_Card_Number          : data.data[i]?.ID_NUMBER,
                    Firstname               : data.data[i]?.NAME,
                    Middlename              : "-",
                    Lastname                : "-",
                    Gender                  : data.data[i]?.GENDER.toLowerCase() === "male" ? "L" : data.data[i]?.GENDER.toLowerCase() === "female" ? "P" : "U",
                    DateOfBirth             : data.data[i]?.BIRTH_DATE ? data.data[i]?.BIRTH_DATE.includes('-') ? null : new Date(data.data[i]?.BIRTH_DATE) : new Date(),
                    DateOfDeath             : data.data[i]?.DATE_OF_DEATH ? new Date(data.data[i]?.DATE_OF_DEATH) : null,
                    PhoneNumber             : data.data[i]?.PHONE_NUMBER,
                    Email                   : data.data[i]?.EMAIL,
                    EmailDocuments          : "-",
                    ExternalCode            : "-",
                    Controlled              : data.data[i]?.CONTROLLED.toLowerCase() === "y" ? true : false,
                    HeldStatus              : false,
                    ClientCrossMethodStatus : false,
                    ClientCrossTo           : "-",
                    RetentionDate           : new Date(),
                    StartDate               : data.data[i]?.START_DATE ? new Date(data.data[i]?.START_DATE) : null,
                    EndDate                 : data.data[i]?.END_DATE ? new Date(data.data[i]?.END_DATE) : null,
                    Notes                   : "-",
                    IsActive                : true,
                    IsDeleted               : false,
                    CreatedAt               : new Date(),
                    UpdatedAt               : new Date(),
                }

                let createDataPersonal = await prisma.BeneficiariesPersonal.create({ data: dataPassingPersonal })
                
                // Step 3 Create Relation Personal & Contract
                let createDataRelationPersonalContract = await prisma.RelationContractAndPersonal.create({
                    data: { BPersonal_ID: createDataPersonal.id, BContract_ID: createDataContract.id }
                })

                // Step 4 Create Wallet Information
                dataPassingWallet.TaxNumber                    = data.data[i]?.TAX ? data.data[i]?.TAX : "-"
                dataPassingWallet.BankName                     = data.data[i]?.ACCOUNT_NAME
                dataPassingWallet.BankAccountHolder            = data.data[i]?.BRANCH
                dataPassingWallet.BankAccountNumber            = data.data[i]?.ACCOUNT_NUMBER
                dataPassingWallet.Bank                         = data.data[i]?.BANK_NAME
                dataPassingWallet.NPWP_Number                  = data.data[i]?.NPWP

                let createWalletInformation = await prisma.WalletInformation.create({ data: dataPassingWallet })

                let createWalletInformationRelation = await prisma.RelationWalltBeneficiaries.create({
                    data: { BPersonal_ID: createDataPersonal.id, Wallet_ID: createWalletInformation.id, BCompany_ID: null }
                })

                // Step 4 Create Address Information
                dataPassingAddress.Address       = data.data[i]?.CORRESPONDENCE_ADDRESS
                dataPassingAddress.RT            = data.data[i]?.C_RT
                dataPassingAddress.RW            = data.data[i]?.C_RW
                dataPassingAddress.KelurahanDesa = data.data[i]?.C_KELURAHAN_OR_DESA
                dataPassingAddress.Kecamatan     = data.data[i]?.C_KECAMATAN
                dataPassingAddress.KabupatenKota = data.data[i]?.C_KOTA_OR_KABUPATEN
                dataPassingAddress.Provinsi      = data.data[i]?.C_PROVINSI
                dataPassingAddress.Negara        = data.data[i]?.C_RT
                dataPassingAddress.KodePos       = data.data[i]?.C_POSTAL_CODE

                let createAddressInformation = await prisma.AddressInformation.create({ data: dataPassingAddress })

                let createAddressInformationRelation = await prisma.RelationAddressBeneficiaries.create({
                    data: { BPersonal_ID: createDataPersonal.id, Address_ID: createAddressInformation.id, BCompany_ID: null }
                })

                // Step 5 Create Administration
                dataPassingAdministration.AdminDeal                           = true
                dataPassingAdministration.ReceivedRate                        = data.data[i]?.SHARE
                dataPassingAdministration.EffectiveRate                       = data.data[i]?.SHARE

                let createAdministration = await prisma.BeneficiariesAdministration.create({ data: dataPassingAdministration })

                let createAdministrationRelation = await prisma.RelationAdministrationBeneficiaries.create({
                    data: { BPersonal_ID: createDataPersonal.id, Administration_ID: createAdministration.id, BCompany_ID: null }
                })
            }
        }

        res.json({
            message: 'Successfull to get data!',
            statusCode: 200,
            statusMessage: 'Successfull to get data!',
            data: data
        })
    // } catch (error) {
    //     console.log(error)
    //     res.json({
    //         message: 'failed to get data!',
    //         statusCode: 400,
    //         statusMessage: 'failed to get data!',
    //     })
    // }
}
// Deleted
// FITRA CHORD BARUS