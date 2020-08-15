import React, {useState, useEffect} from 'react';
import './App.css';
import { MenuItem, FormControl, Select, Card, CardContent} from '@material-ui/core'
import InfoBox from './InfoBox'
import Map from './Map'
import { sortData } from './util'
import Table from './Table'
import LineGraph from './LineGraph'
import "leaflet/dist/leaflet.css"
import { preetyPrintStat } from './util'

//USE EFFECT = It runs a piece of code based on a given condition

function App() {
  const [countries, setCountries] = useState([])
  const [country, setCountry] = useState("worldwide")
  const [countryInfo, setCountryInfo] = useState({})
  const [tableData, setTableData] = useState([])
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 })
  const [mapZoom, setMapZoom] = useState(3)
  const [mapCountries, setMapCountries] = useState([])
  const [casesType, setCasesType] = useState("cases")

  useEffect(()=>{
    fetch('https://disease.sh/v3/covid-19/all')
     .then(response=> response.json())
     .then(data=>{
       setCountryInfo(data)
     })
  },[])

  useEffect(()=>{
    const getCountriesData = async ()=>{
      await fetch("https://disease.sh/v3/covid-19/countries")
            .then(response => response.json())
            .then((data)=>{
              const countries = data.map((country)=>(
                {
                  name: country.country,
                  value: country.countryInfo.iso2
                }))
                const sortedData = sortData(data)
                setTableData(sortedData)
                setMapCountries(data)
                setCountries(countries)
            })
    }
    getCountriesData()
  },[])

  useEffect(()=>{
    fetch('https://disease.sh/v3/covid-19/all')
     .then(response=> response.json())
     .then(data=>{
       setCountryInfo(data)
     })
  },[])

  const onCountryChange = async (event)=>{
    const countryCode = event.target.value
    const url = countryCode === "worldwide" ? 'https://disease.sh/v3/covid-19/all': 
                                              `https://disease.sh/v3/covid-19/countries/${countryCode}`
    await fetch(url)
          .then(response => response.json())  
          .then(data=>{
            setCountry(countryCode)
            setCountryInfo(data)
            setMapCenter([data.countryInfo.lat, data.countryInfo.long])
            setMapZoom(4)
          })
  }
  console.log(countryInfo)
  return (
    <div className="app">
      {/* App Header */}
      <div className="app__left">
            <div className="app__header">
                <h1>COVID-19 TRACKER</h1>
                <FormControl className="app__dropdown">
                  <Select  variant="outlined" value={country} onChange={onCountryChange}>
                    <MenuItem value="worldwide">Worldwide</MenuItem>
                    {
                      countries.map(country=>(
                        <MenuItem value={country.value}>{country.name}</MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>
              </div>
            {/* Info Boxes */}
              <div className="app__stats">
                    <InfoBox active={casesType === "cases"} 
                       isRed
                       onClick={e=> setCasesType("cases")}
                       title="Coronavirus Cases" 
                       cases={preetyPrintStat(countryInfo.todayCases)} 
                       total={preetyPrintStat(countryInfo.cases)}></InfoBox>

                    <InfoBox active={casesType === "recovered"}
                        onClick={e=>setCasesType("recovered")}
                        title="Recoverd" 
                        cases={preetyPrintStat(countryInfo.todayRecovered)} 
                        total={preetyPrintStat(countryInfo.recovered)}></InfoBox>

                    <InfoBox active={casesType === "deaths"}
                        isRed
                        onClick={e=>setCasesType("deaths")}
                        title="Deaths" 
                        cases={preetyPrintStat(countryInfo.todayDeaths)} 
                        total={preetyPrintStat(countryInfo.deaths)}></InfoBox>
              </div>
            {/* Map Component */}
            <div className="app__map">
              <Map casesType={casesType} countries={mapCountries} center={mapCenter} zoom={mapZoom} />
            </div>
          
          </div>
          <Card className="app__right">
            <CardContent>
              <h3>Live cases by country</h3>
              <Table countries={tableData} />
                  <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
              <LineGraph className="app__graph" casesType={casesType} />
            </CardContent>
          </Card>
      </div>
       
  );
}

export default App;
