// ==UserScript==
// @name         WhiskyDivergence
// @namespace    https://dominikbraun.io
// @version      0.1
// @description  An unofficial WB script to find the greatest divergences between the average and a user's rating.
// @author       Dominik Braun
// @match        https://www.whiskybase.com/profile/*/lists/ratings
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

const rateRowsSelector = '.whiskytable tbody tr';
const statsParentSelector = '.table-container-outbreak';
const statsDivClass = 'table-stats';
const statsTableClass = 'whiskytable table compositor user-collection-table';

(function() {
    'use strict';

    let stats = [];

    $(rateRowsSelector).each(function () {
        const stat = readStatsFromRow($(this));
        stats.push(stat);
    });

    stats.sort(sortStats);

    renderDivergences(stats);
})();

function readStatsFromRow(row) {
    const children = row.find('td');

    const avgRating = parseFloat(children[8].innerHTML);
    let userRating = children[9].innerHTML;

    // If there is no user rating, set it to the average rating to
    // procude a divergence of 0. Otherwise, parse the rating.
    if (userRating === '-') {
        userRating = avgRating;
    } else {
        userRating = parseFloat(userRating);
    }

    const difference = userRating - avgRating;
    const isPositive = difference > 0;

    return {
        img: children[0].innerHTML,
        whisky: children[1].innerHTML,
        avgRating: avgRating,
        userRating: userRating,
        divergence: Math.abs(difference).toFixed(2),
        isPositive: isPositive,
    };
}

function sortStats(stat1, stat2) {
    if (stat1.divergence > stat2.divergence) {
        return -1;
    } else if (stat1.divergence < stat2.divergence) {
        return 1;
    }

    return 0;
}

function renderDivergences(stats) {
    const table = $('<table>', {class: statsTableClass, style: 'border-bottom: 1px solid #b4b4b4'});
    table.append(createTableHeader());
    table.append('<tbody>');

    for (let i = 0; i < 10; i++) {
        const row = createRowFromStat(stats[i]);

        table.append(row);
    }

    $(statsParentSelector).prepend(table);
    $(statsParentSelector).prepend(createDivergencesHeading());
}

function createDivergencesHeading() {
    const heading = `
    <div class="table-stats">
		<ul class="stat-icon-list multiline">
			<li>
				<div class="title">Greatest Divergences</div>
				<div class="value">Top 10 Divergences</div>
			</li>
        </ul>
	</div>`

    return heading;
}

function createTableHeader() {
    const img = `<th class="header"></th>`;
    const whisky = `<th class="header">Whisky</th>`;
    const avgRating = `<th class="header">Rating</th>`;
    const userRating = `<th class="header">My rating</th>`;
    const divergence = `<th class="header">Divergence</th>`;

    const row = `<tr>${img}${whisky}${avgRating}${userRating}${divergence}</tr>`;

    const header = $('<thead>', {id: 'whisky-divergence'});
    header.append(row);

    return header;
}

function createRowFromStat(stat) {
    const img = `<td class="photo">${stat.img}</td>`;
    const whisky = `<td>${stat.whisky}</td>`;
    const avgRating = `<td>${stat.avgRating}</td>`;
    const userRating = `<td>${stat.userRating}</td>`;
    const color = stat.isPositive ? '#00B200' : '#C90000';
    const prefix = stat.isPositive ? '+' : '-';
    const divergence = `<td style="color: ${color};">${prefix}${stat.divergence}</td>`;

    const row = `<tr>${img}${whisky}${avgRating}${userRating}${divergence}</tr>`;

    return row;
}
