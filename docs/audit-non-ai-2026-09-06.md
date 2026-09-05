# Non-AI data audit — 6 September 2026

Scope: all six non-AI headline series and all 47 original comparison rows in `data/sources/{war,tobacco,fossil-fuels,food-waste,advertising,gambling}.json`. Primary publications, the stated denominator, geography, price year, publication date, modelling period, and derived arithmetic were checked. 37 comparison rows remain; 10 rows were removed. This report records the checked-out repository's before values, not an assumed earlier public version.

The material problems were definition and attribution errors, unsupported extrapolations, and costs interpreted as guaranteed outcomes. Some retained numbers are deliberately historical or modelled benchmarks. They must be presented as monetary equivalents, with the limitations below visible in the product. They are not quotations for buying interventions in 2026.

## Headline series

| Series | Before | After and evidence |
| --- | --- | --- |
| Military expenditure | $3.1130521T synthetic 2026 extrapolation, using a rounded growth factor and historic series | $2.887T completed-year 2025 estimate, held flat as a 2026 illustration. Published 27 April 2026. No unsupported future growth applied. It covers military expenditure, including expenditure outside active wars. [SIPRI 2025 fact sheet](https://www.sipri.org/publications/2026/sipri-fact-sheets/trends-world-military-expenditure-2025). |
| Smoking | Rounded $1.4T, based on 2012 | Exact study total $1.436T = $422B health expenditure + $1.014T lost productivity, still explicitly 2012, uninflated. The study covers 152 countries/97% of smokers, excludes second-hand smoke and smokeless tobacco. It is economic burden, not industry revenue or a cash budget. Online 2017, journal issue 2018. [Goodchild et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC5801657/). |
| Fossil fuels | $7.4T, 2024 | Number retained. IMF's December 2025 update combines approximately $725B explicit subsidies and $6.7T implicit underpricing, including externalities and forgone consumption taxes. Most of this is not a government cash payment. [IMF working paper 2025/270](https://www.imf.org/en/publications/wp/issues/2025/12/20/underpriced-and-overused-fossil-fuel-subsidies-data-2025-update-572729). |
| Food loss and waste | $1T incorrectly assigned a 2024 monetary data year by combining old FAO costs with new UNEP waste volumes | $936B product-value loss from FAO 2014, Table 19, expressed in 2012 USD with 2005–2009 price inputs. Includes supply-chain food loss and consumer waste; excludes separately estimated subsidies, environmental and social costs. UNEP 2024 does not establish a new global monetary time series. [FAO full-cost accounting](https://www.fao.org/4/i3991e/i3991e.pdf). |
| Advertising | $1.3T for 2026; methodology simultaneously called it “not projected” | Number retained and explicitly called a publisher forecast, released 11 December 2025. It is not an observed 2026 annual total or a live expenditure feed. [WARC December 2025 release](https://www.warc.com/en/press/press-releases/25-12-11_global-ad-market-prospects-upgraded-to-8-but-growth-concentrated-in-Big-Tech-platforms). |
| Gambling | $573B 2024 described as estimate derived from “confirmed 2023 actual” | Number retained only as the January 2024 forecast for 2024. The $536B prior-year figure was also an estimate. Gross win means stakes less payouts in regulated white/grey markets; it is not total stakes, all illegal gambling, a confirmed 2024 outcome, or a 2026 forecast. [H2 original release](https://h2gc.com/news/general/global-gambling-industry-generates-536bn-in-2023-with-7-growth-expected-in-2024). |

## Removed comparisons

These are removed rather than filled with another unverified number. Removal counts refer to occurrences across the six tabs; there are eight unique removed concepts.

| Original row | Occurrences / former denominator | Reason and evidence |
| --- | --- | --- |
| `schools-lmic` | War; $5,900 per complete 13-year education | The claimed $1.25 × 365 × 13 derivation was not a supported complete schooling price in the cited [UNESCO 2015 report](https://unesdoc.unesco.org/ark:/48223/pf0000232197). It mixed a stylized daily figure and calendar days with a universal child education promise. The separate verified UNESCO financing-gap comparison remains under advertising. |
| `extreme-poverty` | War and gambling; $315B annually | The source is an international-dollar poverty gap at 2021 purchasing-power parity. Dividing nominal market-exchange USD by that PPP-denominated sum is invalid. An exact nominal USD transfer cost requires country-level gaps, conversions and delivery assumptions. [World Bank explanation of the June 2025 poverty-line/PPP update](https://www.worldbank.org/en/news/factsheet/2025/06/05/june-2025-update-to-global-poverty-lines). |
| `rainforest-protection` | War and fossil fuels; $45B “all rainforest” | $25 per hectare × 1.8B hectares extrapolated charitable project averages to all tropical forest, conflating tropical forest with rainforest and a project conservation price with permanent legal protection of every hectare. No global programme budget supported this result. [Rainforest Trust impact](https://www.rainforesttrust.org/our-impact/), [FAO forest assessment](https://www.fao.org/forest-resources-assessment/2020/en). |
| `mpower-country` | Tobacco; $5M per country per year | An assumed 45M-person country and selected per-capita cost cannot establish a generic country programme. The cited cases vary by country; the $4M–$61M figures cover 15 years, not one year. [FCTC investment-case paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC11103323/). |
| `copd-care-year` | Tobacco; $5,000 moderate COPD care | The cited PubMed record is Wallace et al., not the attributed Blanchette et al. It is a cost-of-illness study, not a validated $5,000 package of inhalers, exacerbation management and rehabilitation. [Actual paper](https://pubmed.ncbi.nlm.nih.gov/30698096/). |
| `building-retrofit` | Fossil fuels; $650B annually | The source did not establish $650B annually for deep retrofitting global buildings or “all buildings.” A similar $650B IEA current figure is energy-efficiency investment across all end-use sectors, including transport and industry. [IEA Net Zero by 2050](https://www.iea.org/reports/net-zero-by-2050), [IEA Energy Efficiency 2024](https://www.iea.org/reports/energy-efficiency-2024). |
| `public-transit-cities` | Fossil fuels; $5B per city | Invented mixed metro/BRT corridor lengths were multiplied by selected infrastructure rates and presented as a city's transit solution. The source supplies examples and cost ranges, not a standard city-scale programme price. [ITDP BRT Planning Guide](https://brtguide.itdp.org/branch/master/guide/why-brt/costs). |
| `gambling-disorder-treatment` | Gambling; $9,000 annually per person treated | The research measured all healthcare claims for people diagnosed with pathological gambling, including comorbidities. This is not the cost of a gambling-disorder treatment programme. [Rodriguez-Monguio et al.](https://pubmed.ncbi.nlm.nih.gov/29068825/), [investigator summary](https://www.umass.edu/seigma/media/195/download). |

## Retained comparison evidence

The following entries are deduplicated by denominator and methodology; the tabs using them are named explicitly. Changed meanings received new IDs. Translation keys were preserved so the copy audit can update the matching labels without dropping rows.

### `cancer-initial-care-year`

Tabs: war. Before: `cancer-treatment` — $60,000. Retained denominator: **$45,390**, `perUnit`.

NCI annualized average cancer-attributable costs in the first year after diagnosis: USD 43,516.1 for medical services plus USD 1,873.9 for oral prescription drugs, totalling USD 45,390 in 2020 USD. Based on 2007–2013 US Medicare claims, averaging cancer sites and subtracting matched controls without cancer. This is an initial-care cost benchmark, not a complete treatment course, a cure, a global price or an inflation-adjusted 2026 quote.

Evidence: [NCI Cancer Trends Progress Report — Financial Burden of Cancer Care (Mariotto et al. 2020)](https://progressreport.cancer.gov/after/economic_burden) (source year 2020).

### `malaria-control`

Tabs: war. Before: `malaria-eradication` — $90,000,000,000. Retained denominator: **$10,300,000,000**, `annualNeed`.

WHO's 2021 Global Technical Strategy estimated USD 10.3 billion of annual funding for malaria prevention, diagnosis, treatment and programme delivery by 2030. This is the total annual funding target, not the additional funding gap or the cost of global eradication. It excludes the separate estimated USD 0.85 billion per year for research and development. The strategy targets at least a 90% reduction in incidence and mortality by 2030, not eradication by 2050.

Evidence: [WHO — Global Technical Strategy for Malaria 2016–2030, 2021 update](https://www.who.int/publications/i/item/9789240031357) (source year 2021); [WHO Africa — Bridging the funding gap to defeat malaria in Africa](https://www.afro.who.int/news/bridging-funding-gap-defeat-malaria-africa) (source year 2023).

### `world-hunger`

Tabs: war, tobacco, fossil-fuels, food-waste, advertising, gambling. Before: `world-hunger` — $33,000,000,000. Retained denominator: **$33,000,000,000**, `annualNeed`.

Ceres2030's 2020 model estimated average additional public spending of USD 33 billion per year through 2030: USD 14 billion from donors plus USD 19 billion from low- and middle-income governments. The scenario combines reducing hunger, doubling small-producer incomes and limiting agricultural emissions; it assumes coordinated interventions and induced private investment. This is a historical model benchmark, not a current funding quote or a guarantee that money alone ends hunger.

Evidence: [Ceres2030 — Sustainable Solutions to End Hunger, Summary Report](https://ceres2030.iisd.org/wp-content/uploads/2021/03/ceres2030_en-summary-report.pdf) (source year 2020).

### `clean-water`

Tabs: war, tobacco, food-waste, advertising, gambling. Before: `clean-water` — $37,600,000,000. Retained denominator: **$37,600,000,000**, `annualNeed`.

World Bank 2016 baseline estimate of USD 37.6 billion per year in 2015 prices for capital investment to extend safely managed drinking-water services to unserved populations in 140 countries during 2015–2030. This is the drinking-water component only; it excludes the additional ongoing operating and maintenance budget and is not an updated 2026 estimate.

Evidence: [World Bank — The Costs of Meeting the 2030 SDG Targets on Drinking Water, Sanitation, and Hygiene, Summary Report](https://documents1.worldbank.org/curated/en/847191468000296045/pdf/103172-PUB-Box394556B-PUBLIC-EPI-K8632-ADD-SERIES.pdf) (source year 2016).

### `child-vaccination`

Tabs: war, tobacco, advertising. Before: `child-vaccination` — $27,000,000,000. Retained denominator: **$26,980,000,000**, `annualNeed`.

Illustrative annual average of the study's USD 269.8 billion total in 2020 USD for 2021–2030, divided by 10 years: USD 26.98 billion. Covers vaccine products, routine delivery, and included campaigns and stockpiles for IA2030 coverage targets against 14 pathogens in 194 countries. It is the modelled total programme cost, not the incremental funding gap, universal vaccination of every child, or a verified 2026 budget. Costs and coverage vary by year and country.

Evidence: [Sriudomporn et al. — Achieving Immunization Agenda 2030 coverage targets for 14 pathogens, Vaccine: X (2023 issue; online 2022)](https://www.sciencedirect.com/science/article/pii/S2590136222001164) (source year 2023).

### `utility-solar-gw`

Tabs: war, fossil-fuels. Before: `renewable-transition` — $1,000,000,000. Retained denominator: **$691,000,000**, `perUnit`.

Illustrative installed capital cost of 1 GW of utility-scale solar PV: 1,000,000 kW × USD 691/kW, IRENA's global weighted-average total installed cost for projects commissioned in 2024, in 2024 USD. This compares nameplate generating capacity; it does not include a complete electricity system, storage, continuing operations or a fixed number of homes powered. Local project costs vary.

Evidence: [IRENA — Renewable Power Generation Costs in 2024](https://www.irena.org/Digital-Report/Renewable-Power-Generation-Costs-in-2024) (source year 2025).

### `humanitarian-aid`

Tabs: war. Before: `humanitarian-aid` — $33,000,000,000. Retained denominator: **$33,000,000,000**, `annualNeed`.

Approximately USD 33 billion requested in the December 2025 launch of the UN-coordinated Global Humanitarian Overview 2026, targeting 135 million people; USD 23 billion for 87 million people was identified as the immediate priority. This is a launch appeal budget, not the cost of meeting every humanitarian need or the remaining funding gap. Requirements and coverage may be revised during 2026.

Evidence: [UN — Humanitarians launch USD 33 billion appeal for 2026 (8 December 2025)](https://un.dk/humanitarians-launch-33-billion-appeal-for-2026/) (source year 2025).

### `nsclc-initial-care-year`

Tabs: tobacco. Before: `lung-cancer-treatment` — $150,000. Retained denominator: **$70,895.90**, `perUnit`.

NCI annualized average initial-year cancer-attributable costs for non-small-cell lung carcinoma: USD 67,148.1 medical services plus USD 3,747.8 oral prescription drugs, totalling USD 70,895.9 in 2020 USD. Derived from 2007–2013 US Medicare claims. This is a first-year care benchmark, not the cost of a full modern immunotherapy course or a guaranteed cure, and has not been inflated to 2026.

Evidence: [NCI Cancer Trends Progress Report — Financial Burden of Cancer Care (Mariotto et al. 2020)](https://progressreport.cancer.gov/after/economic_burden) (source year 2020).

### `smoking-cessation`

Tabs: tobacco. Before: `smoking-cessation` — $300. Retained denominator: **$275.40**, `perUnit`.

Historical programme benchmark: USD 275.40 per participant for eight weeks of nicotine patches plus telephone counselling and a mailed quit kit in the Oregon Free Patch Initiative (2004–2005; McAfee et al. 2008), reproduced in Table 2 of the cited 2019 systematic review. These are study-era US costs, not a 2026 quote or the cost per successful quit; the programme did not make every participant stop smoking.

Evidence: [CDC Preventing Chronic Disease — Cost-effectiveness of community-based tobacco treatment (2019)](https://www.cdc.gov/pcd/issues/2019/19_0232.htm) (source year 2019).

### `tb-treatment`

Tabs: tobacco. Before: `tb-treatment` — $600. Retained denominator: **$797**, `perUnit`.

WHO reports a median provider cost of USD 797 per person treated for drug-susceptible TB in 2024 across 117 reporting countries with at least 100 first-line patients. Includes drugs, laboratory inputs, programme costs, patient support and inpatient/outpatient care. This is a country median, not a population-weighted global price, a drug-resistant TB regimen or a guarantee of successful treatment; household costs are separate.

Evidence: [WHO Global Tuberculosis Report 2025 — Financing for TB prevention, diagnostic and treatment services](https://www.who.int/teams/global-programme-on-tuberculosis-and-lung-health/tb-reports/global-tuberculosis-report-2025/tb-financing/4-1-financing-for-tb-prevention--diagnostic-and-treatment-services) (source year 2025).

### `clean-cooking-access`

Tabs: fossil-fuels. Before: `clean-cooking-lmic` — $8,000,000,000. Retained denominator: **$8,000,000,000**, `annualNeed`.

IEA's 2023 Access for All scenario requires about USD 8 billion per year in total investment in clean-cooking stoves, equipment and infrastructure to reach universal access by 2030, compared with around USD 2.5 billion at the time. This is total capital investment, not USD 8 billion of additional annual funding or a budget covering ongoing fuel affordability for every household.

Evidence: [IEA — A Vision for Clean Cooking Access for All, executive summary](https://www.iea.org/reports/a-vision-for-clean-cooking-access-for-all/executive-summary) (source year 2023).

### `climate-adaptation-ssa`

Tabs: fossil-fuels. Before: `climate-adaptation-africa` — $50,000,000,000. Retained denominator: **$51,000,000,000**, `annualNeed`.

Estimated annual adaptation finance needs of USD 51 billion in sub-Saharan Africa, reported by UNEP Finance Initiative in April 2026 from UNEP's Adaptation Gap Report. This is a regional annual finance-needs benchmark, not all of Africa, a verified annual funding gap, or the amount that would eliminate climate damage. Actual costs vary by location, hazard and adaptation pathway.

Evidence: [UNEP Finance Initiative — Turning climate adaptation investments into real-world impact in Africa and the Middle East](https://www.unepfi.org/themes/climate-change/turning-climate-adaptation-investments-into-real-world-impact-in-africa-and-the-middle-east/) (source year 2026); [UNEP — Adaptation Gap Report 2025](https://www.unep.org/resources/adaptation-gap-report-2025) (source year 2025).

### `grid-storage-100gwh`

Tabs: fossil-fuels. Before: `grid-storage-100gwh` — $20,000,000,000. Retained denominator: **$19,200,000,000**, `perUnit`.

Illustrative installed capital cost of 100 GWh of battery storage at IRENA's 2024 global benchmark of USD 192/kWh: 100,000,000 kWh × USD 192/kWh = USD 19.2 billion. This is energy-storage capacity, not annual electricity generation or a complete grid upgrade. Costs vary by discharge duration, location and project design; operations, replacement and broader grid expansion are additional.

Evidence: [IRENA — Renewable Power Generation Costs in 2024](https://www.irena.org/Digital-Report/Renewable-Power-Generation-Costs-in-2024) (source year 2025).

### `rutf-carton`

Tabs: food-waste. Before: `rutf-malnutrition` — $80. Retained denominator: **$46.70**, `perUnit`.

UNICEF's weighted-average procurement price in 2024 was USD 46.70 per carton of ready-to-use therapeutic food containing 150 sachets. The comparison is for the food commodity only. It excludes programme staffing, diagnosis, delivery and other medical care; cartons are not interchangeable with children cured or lives saved. Prices depend on UNICEF's procurement terms and scale.

Evidence: [UNICEF Supply Division — Ready-to-Use Therapeutic Food Market and Supply Update, December 2025](https://www.unicef.org/supply/media/24596/file/RUTF-Market-and-Supply-Update-2025.pdf) (source year 2025).

### `school-meals`

Tabs: food-waste. Before: `school-meals` — $50. Retained denominator: **$50**, `perUnit`.

World Food Program USA's undated public fundraising page states that USD 50 can provide one child with school meals for a school year. Used as a programme illustration, not a universal audited unit cost or the cost of all food a child needs for a calendar year. School calendars, meal composition, programme coverage and delivery costs vary; the source does not specify a price year.

Evidence: [World Food Program USA — School Meals (undated page, accessed September 2026)](https://wfpusa.org/work/programs/school-meals/) (source year 2026).

### `emergency-food-ration`

Tabs: food-waste. Before: `emergency-food-ration` — $0.43. Retained denominator: **$0.43**, `perUnit`.

Historical 2021 WFP emergency-plan benchmark: USD 0.43 per person per day, averaged across 43 famine-risk countries, to provide one basic daily meal. The USD 6.6 billion plan aimed to support about 42 million people for one year and included programme delivery costs. This is not a current global meal price or the cost of a complete nutritious daily diet.

Evidence: [WFP — Plan to support 42 million people on the brink of famine](https://www.wfp.org/stories/wfps-plan-support-42-million-people-brink-famine) (source year 2021).

### `smallholder-climate-finance`

Tabs: food-waste. Before: `smallholder-climate-finance` — $75,000,000,000. Retained denominator: **$75,000,000,000**, `annualNeed`.

A 2024 IFAD opinion piece estimates an approximately USD 75 billion annual climate-finance gap for small-scale farmers. The author explicitly calls it a ballpark: it allocates agrifood climate-finance needs by small farms' 35% share of food production and includes adaptation and mitigation. This is an assumption-dependent benchmark, not a bottom-up costing or an established bill for protecting every farmer.

Evidence: [IFAD — The $75 Billion Climate Finance Gap for small-scale farmers](https://www.ifad.org/en/w/opinions/the-75-billion-climate-finance-gap-an-imperfect-but-important-figure-for-small-scale-farmers) (source year 2024).

### `food-systems-transformation`

Tabs: food-waste. Before: `food-systems-transformation` — $400,000,000,000. Retained denominator: **$400,000,000,000**, `annualNeed`.

IFAD's July 2023 statement describes a global ambition to mobilise as much as USD 400 billion each year until 2030 from governments, the private sector and development partners for food-system transformation. This is a financing target and order-of-magnitude comparison, not an audited additional funding gap, a current 2026 cost estimate or a guarantee of sustainable food systems.

Evidence: [IFAD — Transforming Global Food Systems: $400 billion needed per year](https://www.ifad.org/en/w/news/transforming-global-food-systems-400-billion-needed-per-year-while-doing-nothing-could-cost-12-trillion) (source year 2023).

### `depression-anxiety-scale-up`

Tabs: advertising. Before: `mental-health-care-gap` — $9,800,000,000. Retained denominator: **$147,000,000,000**, `perUnit`.

The 2016 WHO-led study estimated USD 147 billion in net present value for scaling up depression and anxiety treatment across 36 countries over 2016–2030. Costs are expressed in constant 2013 USD and discounted at 3%; the comparison uses the full 15-year modelled investment envelope. Dividing this discounted total by 15 would not establish an annual cash funding need. It is not a universal mental-health programme or an updated 2026 quotation.

Evidence: [WHO — Investing in treatment for depression and anxiety leads to fourfold return](https://www.who.int/news/item/13-04-2016-investing-in-treatment-for-depression-and-anxiety-leads-to-fourfold-return) (source year 2016); [Chisholm et al. — Scaling-up treatment of depression and anxiety, The Lancet Psychiatry](https://www.thelancet.com/journals/lanpsy/article/PIIS2215-0366(16)30024-4/fulltext) (source year 2016).

### `education-financing-gap`

Tabs: advertising. Before: `education-financing-gap` — $97,000,000,000. Retained denominator: **$97,000,000,000**, `annualNeed`.

UNESCO's 2023 model estimates an average annual financing gap of USD 97 billion during 2023–2030 for 79 low- and lower-middle-income countries to reach their national SDG 4 education benchmarks. This is the gap after projected domestic resources, not the total education budget or the cost of universal education for every child worldwide. It is a model-period average, not a measured 2026 shortfall.

Evidence: [UNESCO Global Education Monitoring Report — annual financing gap of almost $100 billion](https://www.unesco.org/en/articles/annual-financing-gap-education-almost-100-billion) (source year 2023); [UNESCO GEM Report — Can countries afford their national SDG 4 benchmarks? (full report)](https://unesdoc.unesco.org/ark:/48223/pf0000385004) (source year 2023).

### `who-annual-budget`

Tabs: advertising. Before: `who-annual-budget` — $3,417,000,000. Retained denominator: **$3,103,350,000**, `perUnit`.

Annualized reference for WHO's approved 2026–2027 programme budget: USD 6,206.7 million divided by two = USD 3,103.35 million. Includes base programmes, polio eradication, special programmes, and the initial emergency-operations envelope. This is an arithmetic annual average of a two-year authorization, not spending already financed or an immutable annual budget; emergency needs can change.

Evidence: [WHO — Approved Programme budget 2026–2027, resolution WHA78.2 (27 May 2025)](https://apps.who.int/gb/ebwha/pdf_files/WHA78/A78_R2-en.pdf) (source year 2025).

### `malaria-rd-target`

Tabs: advertising. Before: `malaria-rd-funding` — $673,000,000. Retained denominator: **$851,000,000**, `annualNeed`.

WHO's World Malaria Report 2024 reports an annual malaria research-and-development financing target of USD 851 million for 2021–2030. This is a funding target, not the amount actually invested or an additional shortfall. It is separate from the malaria-control and elimination programme target and does not guarantee development of a particular vaccine, medicine or cure.

Evidence: [WHO — World Malaria Report 2024, malaria research and development funding target](https://cdn.who.int/media/docs/default-source/malaria/world-malaria-reports/world-malaria-report-2024-spreadview.pdf) (source year 2024).

### `supportive-housing-la-year`

Tabs: gambling. Before: `permanent-supportive-housing` — $13,000. Retained denominator: **$16,035**, `perUnit`.

Historical Los Angeles Housing for Health benchmark: RAND's 2017 report lists USD 16,035 as the median annual programme cost among 890 participants in the first year after housing (Table 3.11). Covers housing subsidy and case-management services; excludes administrative costs and construction or acquisition of housing. This is a local study-era operating-cost reference, not a 2026 US or worldwide housing price.

Evidence: [RAND — Evaluation of Housing for Health Permanent Supportive Housing Program, Table 3.11 (2017)](https://www.rand.org/content/dam/rand/pubs/research_reports/RR1600/RR1694/RAND_RR1694.pdf) (source year 2017).

### `mental-health-financing-gap`

Tabs: gambling. Before: `mental-health-financing-gap` — $200,000,000,000. Retained denominator: **$200,000,000,000**, `annualNeed`.

United for Global Mental Health's 2023 financing report estimates a global annual mental-health financing gap of at least USD 200 billion. The comparison uses this lower-bound funding benchmark, not a precise current-year budget or a guarantee that all mental-health needs can be met. It covers broader mental-health services than the separate 36-country depression-and-anxiety scale-up study.

Evidence: [United for Global Mental Health — US$200 billion financing gap report](https://unitedgmh.org/newsroom/2023-us200-billion-financing-gap-new-report-calls-for-urgent-investment-in-mental-health-on-world-mental-health-day/) (source year 2023).

### `988-administration-award`

Tabs: gambling. Before: `suicide-crisis-lifeline` — $255,000,000. Retained denominator: **$255,000,000**, `perUnit`.

On 15 May 2026, HHS/SAMHSA announced a USD 255 million award to Vibrant Emotional Health to administer the US 988 Suicide & Crisis Lifeline. The announcement does not establish that this award equals one year of all national and local 988 costs. The comparison counts award-size funding equivalents, not years of operating the whole network or lives saved.

Evidence: [HHS — SAMHSA Awards $255 Million to Administer 988 Lifeline](https://www.hhs.gov/press-room/samhsa-awards-255-million-to-administer-988-lifeline.html) (source year 2026).

Additional exact evidence locations:

- NCI's initial-year cancer table: $43,516.1 medical + $1,873.9 oral prescription drugs = $45,390; NSCLC $67,148.1 + $3,747.8 = $70,895.9. Its 2020 price basis is separate from the 2007–2013 claims period. The former lung-cancer link was misattributed: [PMC11940980](https://pmc.ncbi.nlm.nih.gov/articles/PMC11940980/) is Chopra et al. 2025 and reports monthly all-cause treatment costs, not a $150,000 complete course.
- CDC 2019 review, Table 2: McAfee et al. 2008, Oregon 2004–2005, eight weeks of patches plus counselling/kit at $275.40 per participant. This is cost per participant, not per successful quit.
- UNICEF December 2025 market report: 2024 weighted-average price $46.70 per 150-sachet carton. A carton cannot be counted as a cured child.
- RAND RR1694, Table 3.11: median programme cost $16,035, mean $15,288, 890 people. The denominator uses the median, not an unsupported $13,000 approximation.
- Chisholm et al. 2016, journal page 416 / PDF page 2: 3% discounting, all costs in constant 2013 USD; $147B is the full 2016–2030 net present value, not $9.8B of annual cash need. [Accessible copy of the original paper](https://docs.house.gov/meetings/IF/IF00/20160614/105076/HMKP-114-IF00-20160614-SD013.pdf).
- WHO resolution WHA78.2, 27 May 2025: approved $6,206.7M biennium, so annualized reference is $3,103.35M. The former $3,417M was a different budget proposal/period, not the approved 2026–2027 total divided by two.
- IRENA 2025 report for 2024: global utility-scale PV installed cost $691/kW, therefore $691M/GW; battery systems' total installed cost $192/kWh, therefore $19.2B/100 GWh. These are physical capacity benchmarks, not complete energy systems or guaranteed household electricity supply.

## Interpretation and remaining limits

1. Price years are deliberately not silently harmonized. Historic USD, current USD, forecast amounts and modelled funding targets support approximate scale comparisons. They do not establish exact contemporary purchasing power or realizable budget savings. PPP poverty-gap comparisons were removed because they additionally used a different currency concept.
2. The tobacco burden and most fossil-fuel underpricing are not cash that can simply be redirected. Food product-value loss is not a recoverable appropriation. Gambling gross win and advertising expenditure represent different economic quantities. The user interface must state these distinctions.
3. Annual targets are not necessarily outstanding funding gaps. Per-unit costs do not imply treatment success, lives saved, eradication or universal programme delivery. Hunger, water, education and other models depend on geography, intervention mix, institutional capacity and the study period.
4. Each comparison is an alternative illustration. Reused hunger and water figures are identical; they must not be added together across tabs. The food-system, hunger, climate-finance and other budgets can overlap and are not additive programme components.
5. Some original sources are historical, forecasts, advocacy estimates or undated fundraising examples. Their retention validates attribution and the specified arithmetic, not precision or proof that a newer global quote does not exist. In particular: smoking is based on 2012; food valuation on 2012 USD; H2 remains a January 2024 forecast; school meals is an undated fundraising page; smallholder climate finance is explicitly a ballpark opinion; the global mental-health gap is a lower bound. These limits are stated in each dataset.
6. The vaccination paper's publication chronology is online December 2022 / journal issue April 2023. The complete Methods section, verified through the [Europe PMC full-text XML](https://www.ebi.ac.uk/europepmc/webservices/rest/PMC9850055/fullTextXML), specifies 2020 USD. No discounting is described in the full text. The cited $269.8B is the ten-year total and $26.98B is its illustrative arithmetic annual average; all three shared rows and four locale labels state this price basis.
7. Previous repository fact-check documents are historical artifacts, not validation of the corrected data. Where they endorse a removed or redefined comparison, this report and the amended JSON supersede that endorsement.

## Validation

The audit's mechanical check parses all seven source JSON files, checks positive finite amounts, unique IDs within each source, and exact agreement of unit cost, scale hint, methodology and sources for reused IDs. It also verifies the six non-AI counts (7 / 6 / 5 / 7 / 7 / 5). App/schema tests and localized label/render checks are handled by the integrating audit and must not be inferred from this evidence review alone.
