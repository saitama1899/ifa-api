const languages = require('./languages.json');

function initialPrompt() {
  const prompt = `
    Vas a realizar un analisis de un curriculum y una oferta de trabajo. El objetivo del analisis será el de ayudar al candidato a conseguir ese puesto de trabajo. Te mandaré la información en los siguientes mensajes. Los puntos a analizar son los siguientes:
    1- Fallos en el curriculum, faltas de ortografia... Si el campo CV en texto esta vacio, recomienda al candidato que lo rellene y como hacerlo. No hagas comentarios sobre el formato del CV.
    2- Cambios para adaptarlo mejor a la oferta en cuestion.
    3- Previsión del proceso de selección, posibles preguntas y preparacion.
    4- Porcentaje de compatibilidad de la oferta de trabajo con el curriculum.
    5- Porcentaje de exito de conseguir el puesto de trabajo.
    Ten en cuenta que:
    - Los datos extraidos del CV son en formato web y no en texto plano, por lo que deberias ignorar recomendaciones sobre formato clasico de CV.
    - El formato de tu respuesta no debe contener el titulo de cada punto. Solo debe contener la respuesta. Por ejemplo: '1- He detectado...'.
    - Ignora que falten los datos de contacto.
    - Tu respuesta deber estar en el idioma del curriculum.
    - Dirigete en primera persona al candidato y hablale de tu.
    - El punto 4 y 5 deben estar en porcentaje acompañado posteriormente de un texto explicativo. Siempre debe contener un porcentaje.
    - Evita ser reduntante, aporta valor y detalla lo que consideres necesario.
    - En el punto 5, se mas pesimista, piensa en lo competido que pueda estar el sector.
    - El candidato no puede detallar sus estudios, centrate solo en el nivel de los mismos.
    - Ignora la duracion de cada experiencia, solo fijate en el campo: Años de experiencia.
    - No saludes y al despedirte simplemente desea suerte al candidato.
  `
  return prompt
}

function getOfferDescription(offerInfo) {
  const noData = 'Sin especificar'
  const title = offerInfo?.title !== ''
    ? offerInfo?.title
    : noData
  const city = offerInfo?.city !== ''
    ? offerInfo?.city
    : noData
  const subcategory = offerInfo?.subcategory?.value !== ''
    ? offerInfo?.subcategory?.value
    : noData
  const experienceMin = offerInfo?.experienceMin?.value !== ''
    ? offerInfo?.experienceMin?.value
    : noData
  const studiesMin = offerInfo?.studiesMin?.value !== ''
    ? offerInfo?.studiesMin?.value
    : noData
  const minRequirements = offerInfo?.minRequirements !== ''
    ? offerInfo?.minRequirements
    : noData
  const description = offerInfo?.description !== ''
    ? offerInfo?.description
    : noData
  const desiredRequirements = offerInfo?.desiredRequirements !== ''
    ? offerInfo?.desiredRequirements
    : noData
  const contractDuration = offerInfo?.contractDuration !== ''
    ? offerInfo?.contractDuration
    : noData
  const skillsList = offerInfo?.skillsList?.length > 0
    ? offerInfo?.skillsList.map(skill => skill?.skill).join(', ')
    : noData

  const offerDescription = `
    - Oferta -
    Título: ${title} 
    Ciudad: ${city} 
    Subcategoría: ${subcategory} 
    Experiencia mínima: ${experienceMin}
    Estudios mínimos: ${studiesMin} 
    Requisitos mínimos: ${minRequirements} 
    Descripción: ${description} 
    Requisitos deseados: ${desiredRequirements} 
    Duración del contrato: ${contractDuration} 
    Habilidades: ${skillsList} 
  `
  return offerDescription.substring(0, 4000)
}

function getProfileDescription(curriculumInfo) {
  const noData = 'No data'
  const cvtext = curriculumInfo?.cvtext !== ''
    ? curriculumInfo?.cvtext.substring(0, 700)
    : noData
  const education = curriculumInfo?.education?.length > 0
    ? curriculumInfo?.education.map(education => education?.courseName || `${education?.educationLevelCode}:${education?.courseCode}`).join(', ')
    : noData
  const experience = curriculumInfo?.experience?.length > 0
    ? curriculumInfo?.experience.map(experience =>
      `${experience?.job}: ${experience?.description.substring(0, 400)}`).join('')
    : noData
  const working = curriculumInfo?.working 
    ? 'Trabajando.' 
    : 'Sin trabajo.'
  const futureJobGoals = curriculumInfo?.futureJobGoals !== ''
    ? curriculumInfo?.futureJobGoals
    : noData
  const motivationToChange = curriculumInfo?.motivationToChange !== ''
    ? curriculumInfo?.motivationToChange
    : noData
  const yearsOfExperience = curriculumInfo?.yearsOfExperience !== ''
    ? curriculumInfo?.yearsOfExperience
    : noData
  const preferredPosition = curriculumInfo?.preferredPosition !== ''
    ? curriculumInfo?.preferredPosition
    : noData
  
  const expertise = curriculumInfo?.expertise?.length > 0
    ? curriculumInfo?.expertise?.reduce((acc, expertise) => {
      const level = expertise?.level
      const skill = expertise?.skill
      if (acc[level]) {
        acc[level].push(skill)
      } else {
        acc[level] = [skill]
      }
      return acc
    }, {})
    : noData

  const expertiseInfo = Object.keys(expertise).map(level => `${level}: ${expertise[level].join(', ')}`).join(', ')
  const languagesNames = curriculumInfo?.language?.length > 0
    ? curriculumInfo?.language.map(language => getLanguageNameById(language?.id)).join(', ')
    : noData
  const profileDescription = `
    - Curriculum -
    CV en texto: ${cvtext} 
    Educación: ${education} 
    Experiencias laborales: ${experience} 
    Estado: ${working} 
    Motivación para cambiar: ${motivationToChange} 
    Metas profesionales: ${futureJobGoals} 
    Años de experiencia: ${yearsOfExperience} 
    Posición preferida: ${preferredPosition} 
    Habilidades por nivel: ${expertiseInfo}
    Idiomas: ${languagesNames}
  `
  return profileDescription.substring(0, 4000)
}

const getLanguageNameById = (id) => {
  const language = languages.find(l => l.id === id);
  return language ? language.value : null;
}

module.exports = {
  initialPrompt,
  getOfferDescription,
  getProfileDescription
}