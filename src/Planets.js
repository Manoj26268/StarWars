import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Planets = () => {
  const [planets, setPlanets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [loadingPlanets, setLoadingPlanets] = useState(true);
  const [loadingResidents, setLoadingResidents] = useState(false);

  useEffect(() => {
    const fetchPlanets = async (page) => {
      try {
        setLoadingPlanets(true);
        const response = await axios.get(`https://swapi.dev/api/planets/?page=${page}&format=json`);
        setPlanets(response.data.results);
        setNextPage(response.data.next);
        setPrevPage(response.data.previous);

        // Fetch residents for each planet
        setLoadingResidents(true);
        const planetsWithResidents = await Promise.all(
          response.data.results.map(async (planet) => {
            if (planet.residents && planet.residents.length > 0) {
              const residents = await fetchResidents(planet.residents);
              return { ...planet, residents };
            } else {
              return planet;
            }
          })
        );

        setPlanets(planetsWithResidents);
      } catch (error) {
        console.error('Error fetching planets:', error);
      } finally {
        setLoadingPlanets(false);
        setLoadingResidents(false);
      }
    };

    fetchPlanets(currentPage);
  }, [currentPage]);

  const fetchResidents = async (residentUrls) => {
    const residentPromises = residentUrls.map(url => axios.get(url));
    const residents = await Promise.all(residentPromises);
    return residents.map(resident => ({
      name: resident.data.name,
      height: resident.data.height,
      mass: resident.data.mass,
      gender: resident.data.gender
    }));
  };

  const handleNext = () => {
    if (nextPage) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handlePrev = () => {
    if (prevPage) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  return (
    <div>
      <h1>Star Wars Planets</h1>
      <div className="planets-container">
        {loadingPlanets ? (
          <img src="/icons8-in-progress.gif" alt="Loading planets..." />
        ) : (
          planets.map((planet, index) => (
            <div key={index} className="planet-card">
              <h2>{planet.name}</h2>
              <p>Climate: {planet.climate}</p>
              <p>Population: {planet.population}</p>
              <p>Terrain: {planet.terrain}</p>

              <h3>Residents:</h3>
              {loadingResidents ? (
                <img src="/icons8-in-progress.gif" alt="Loading residents..." />
              ) : (
                <ul>
                  {planet.residents && planet.residents.length > 0 ? (
                    planet.residents.map((resident, i) => (
                      <li key={i}>
                        {resident.name} - {resident.height} cm, {resident.mass} kg, {resident.gender}
                      </li>
                    ))
                  ) : (
                    <li>No residents</li>
                  )}
                </ul>
              )}
            </div>
          ))
        )}
      </div>



    {/* <div className='pagination_container'> */}
      <div className="pagination">
        {prevPage !== null && (
          <button onClick={handlePrev} className="prev-button">
            Previous
          </button>
        )}
        {nextPage !== null && (
          <button onClick={handleNext} className="next-button">
            Next
          </button>
        )}
      </div>
      </div>
    // </div>
  );
};

export default Planets;
